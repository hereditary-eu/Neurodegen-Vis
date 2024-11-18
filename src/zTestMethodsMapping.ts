export const zTestMethodsMapping: { [key: string]: string[] } = {
    attent_z_comp: [
        "corsi_done",
        "digit_span_done",
        "dot_score_done",
        "dot_span_done",
        "tmt_a_done",
    ],
    exec_z_comp: [
        "tmt_b_done",
        "stroop_t_done",
        "stroop_e_done",
        "flu_a_done",
        "phon_flu_done",
        "flu_f_done",
        "flu_s_done",
        "cat_flu_done",
        "fab_done",
    ],
    visuosp_z_comp: [
        "cdt_done",
        "benton_done",
        "vosp_done",
        "rocf_c_done",
        "rocf_d_done",
    ],
    memory_z_comp: ["rc_score_done", "ravlt_t_done", "wpat_done"],
    language_z_comp: [
        "naming_done",
        "boston_done",
        "similarities_done",
        "sim_w4_done",
        "flu_a_done",
        "flu_f_done",
        "cat_flu_done",
    ],
};

const z_score_features: string[] = [
    "attent_z_comp",
    "exec_z_comp",
    "visuosp_z_comp",
    "memory_z_comp",
    "language_z_comp",
    "npsid_rep_moca_c",
    "npsid_rep_mmse_c",
    "st_ter_daed",
    "st_ter_leed",
    "updrs_3_on",
];

interface stringMap {
    [key: string]: string;
}
const z_failed_tests: stringMap = {
    attent_z_comp: "attent_sum_z",
    exec_z_comp: "exec_sum_z",
    visuosp_z_comp: "visuosp_sum_z",
    memory_z_comp: "memory_sum_z",
    language_z_comp: "language_sum_z",
};
const z_failed_tests_tot: stringMap = {
    attent_z_comp: "attent_sum",
    exec_z_comp: "exec_sum",
    visuosp_z_comp: "visuosp_sum",
    memory_z_comp: "memory_sum",
    language_z_comp: "language_suz",
};
