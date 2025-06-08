import math
import random
import invoke
import pandas as pd
from snsynth.mwem import MWEMSynthesizer


@invoke.tasks.task()
def generate(ctx: invoke.context.Context):
    df = pd.read_csv("public/dataset/PD_SampleData_Curated.csv", index_col=None)

    date_bounds = {}
    for date_col in ["npsid_data_npsi", "npsid_bdate", "npsid_rm_date", "npsid_rm_date2"]:
        as_date = pd.to_datetime(df[date_col], dayfirst=True)
        date_bounds[date_col] = (as_date.min(), as_date.max())
        df[date_col] = (as_date - as_date.min()).map(lambda d: d.days if d else float("nan"))
        print(f"parsed {date_col} to date and then to int")

    ordinal_columns = ["record_id"] if "record_id" in df.columns else []
    continuous_columns = [col for col in df.columns if df[col].dtype in (int, float) and col not in ordinal_columns]
    categorical_columns = [col for col in df.columns if col not in continuous_columns + ordinal_columns]
    print(f"{ordinal_columns=}")
    print(f"{continuous_columns=}")
    print(f"{categorical_columns=}")

    for col in categorical_columns:
        print(col, df[col].unique())

    continuous_bounds = {}
    continuous_mean_std = {}
    for col in continuous_columns:
        clean = df[col].dropna()
        if pd.isna(clean.mean()):
            print("drop", col)
            df.drop(col, inplace=True, axis=1)
            continue
        continuous_bounds[col] = clean.min(), clean.max()
        continuous_mean_std[col] = clean.mean(), clean.std()

    continuous_columns = list(continuous_bounds.keys())
    assert len(continuous_columns) + len(categorical_columns) + len(ordinal_columns) == len(df.columns)

    print(continuous_mean_std)
    corr = df[continuous_columns].corr()

    synth = MWEMSynthesizer(epsilon=2.0, verbose=True)
    synth.fit(df[categorical_columns], preprocessor_eps=1.0, categorical_columns=categorical_columns, nullable=True)
    cat_sample: pd.DataFrame = synth.sample(100)  # type: ignore return mismatch

    def sample_continuous(col: str, previous_cols: dict[str, int | float]) -> int | float:
        mean, std = continuous_mean_std[col]
        shift = 0
        for pcol, pval in previous_cols.items():
            pmean, pstd = continuous_mean_std[pcol]
            if pd.isna(corr[col][pcol]) or abs(pstd) < 1e-5:
                continue
            contribution = corr[col][pcol] * (pval - pmean) / pstd
            shift += contribution
        shift = (1 if shift >= 0 else -1) * (math.sqrt(1.0 + abs(shift)) - 1.0)
        value = random.normalvariate(mean, 0.6 * std) + 0.75 * shift * std  # take % of std to not hit bounds
        assert -1e6 < value < 1e6, (col, value, mean, std, previous_cols)
        return float(value) if df[col].dtype == float else int(value)

    generated_rows = []
    ord_counter = 0
    ord_std = df["record_id"].std()
    shuffled_cols = list(df.columns).copy()
    for i, cat_row in cat_sample.iterrows():
        row = {}
        random.shuffle(shuffled_cols)
        ord_counter += max(1, int(random.normalvariate(mu=0, sigma=ord_std / len(df))))
        for i, col in enumerate(shuffled_cols):
            if col in ordinal_columns:
                row[col] = ord_counter
            elif col in categorical_columns:
                row[col] = cat_row[col]
            elif col in continuous_columns:
                pcols = {c: row[c] for c in shuffled_cols[:i] if c in continuous_columns}
                row[col] = sample_continuous(col, pcols)
            else:
                raise NameError()
        generated_rows.append(row)

    sample = pd.DataFrame(generated_rows, columns=df.columns)
    for col, bounds in continuous_bounds.items():
        delta = bounds[1] - bounds[0]
        loose_bounds = bounds[0] - 0.1 * delta, bounds[1] + 0.1 * delta
        sample[col] = sample[col].clip(*loose_bounds)
    for date_col, bounds in date_bounds.items():
        sample[date_col] = sample[date_col].map(lambda days: bounds[0] + pd.Timedelta(days=int(days)))
    sample.to_csv("public/dataset/noisy.csv", float_format="%.2f")
