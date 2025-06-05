import invoke
from snsynth.mwem import MWEMSynthesizer

# from snsynth.mst import MSTSynthesizer
import pandas as pd


@invoke.tasks.task()
def generate(ctx: invoke.context.Context):
    df = pd.read_csv("public/dataset/PD_SampleData_Curated.csv", index_col=None)
    df = df.drop(
        ["npsid_data_npsi", "npsid_bdate", "npsid_rm_date", "npsid_rm_date2"],
        axis=1,
    )

    cols = list(df.columns)[:6]
    synth = MWEMSynthesizer(epsilon=3.0, verbose=True)
    synth.fit(df[cols], preprocessor_eps=1.0)
    sample = synth.sample(100)
    print(sample)
    sample.to_csv("public/dataset/noisy.csv")

    # sample_conditional = synth.sample_conditional(100, "age < 50 AND income > 1000")
    # print(sample_conditional)
