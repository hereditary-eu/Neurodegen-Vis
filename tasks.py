import random
import invoke
import pandas as pd
from snsynth.mwem import MWEMSynthesizer


@invoke.tasks.task()
def generate(ctx: invoke.context.Context):
    df = pd.read_csv("public/dataset/PD_SampleData_Curated.csv", index_col=None)
    df.fillna(0, inplace=True)  # ignore nan values

    date_bounds = {}
    for date_col in ["npsid_data_npsi", "npsid_bdate", "npsid_rm_date", "npsid_rm_date2"]:
        as_date = pd.to_datetime(df[date_col], dayfirst=True)
        date_bounds[date_col] = (as_date.min(), as_date.max())
        df[date_col] = (as_date - as_date.min()).map(lambda d: d.days)  # to int
        print(f"parsed {date_col} to date and then to int")

    columns = list(df.columns)
    ordinal_columns = ["record_id"] if "record_id" in columns else []
    continuous_columns = [col for col in columns if df[col].dtype in (int, float) and col not in ordinal_columns]
    categorical_columns = [col for col in columns if col not in continuous_columns + ordinal_columns]
    print(f"{ordinal_columns=}")
    print(f"{continuous_columns=}")
    print(f"{categorical_columns=}")

    for col in categorical_columns:
        print(col, df[col].unique())

    continuous_bounds = {}
    continuous_mean_std = {}
    for col in continuous_columns:
        continuous_bounds[col] = df[col].min(), df[col].max()
        continuous_mean_std[col] = df[col].mean(), df[col].std()

    synth = MWEMSynthesizer(epsilon=2.0, verbose=True)
    synth.fit(
        df[categorical_columns],
        preprocessor_eps=1.0,
        categorical_columns=categorical_columns,
    )
    cat_sample: pd.DataFrame = synth.sample(100)  # type: ignore return type

    def sample_continuous(col: str):
        value = random.normalvariate(*continuous_mean_std[col])
        return value if df[col].dtype == float else int(value)

    generated_rows = []
    ord_counter = 0
    ord_std = df["record_id"].std()
    for i, cat_row in cat_sample.iterrows():
        ord_counter += max(1, int(random.normalvariate(mu=0, sigma=ord_std / len(df))))
        generated_rows.append(
            [
                ord_counter
                if col in ordinal_columns
                else cat_row[col]
                if col in categorical_columns
                else sample_continuous(col)
                for col in columns
            ]
        )

    sample = pd.DataFrame(generated_rows, columns=columns)
    for col, bounds in continuous_bounds.items():
        sample[col].clip(*bounds, inplace=True)
    for date_col, bounds in date_bounds.items():
        sample[date_col] = sample[date_col].map(lambda days: bounds[0] + pd.Timedelta(days=days))
    sample.to_csv("public/dataset/noisy.csv", float_format="%.2f")
