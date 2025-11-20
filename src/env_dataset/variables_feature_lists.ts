export const cat_features_mapping: { [key: string]: string[] } = {
  attent_z_comp: ["corsi_done", "digit_span_done", "dot_score_done", "dot_span_done", "tmt_a_done"],
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
  visuosp_z_comp: ["cdt_done", "benton_done", "vosp_done", "rocf_c_done", "rocf_d_done"],
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

export const cat_features_generic: string[] = ["None", "k_mean_cluster", "z_diagnosis"];
// TODO, add , "ins_npsi_sex" to numeric, adapt code in scatterplot to show correct legend

export const cov_features: string[] = [
  "insnpsi_age",
  "npsid_ddur_v",
  "ins_npsi_sex",
  "npsid_yearsed",
  "overall_domain_sum",
  "npsid_rep_moca_c",
  "npsid_rep_mmse_c",
  "attent_z_comp",
  "exec_z_comp",
  "visuosp_z_comp",
  "memory_z_comp",
  "language_z_comp",
  "st_ter_daed",
  "st_ter_leed",
  "updrs_3_on",
  "rc_score_done",
  "sdmt_done",
  "flu_a_done",
  "phon_flu_done",
  "pc1",
  "pc2",
];

export const cov_features_init: string[] = [
  "insnpsi_age",
  "npsid_ddur_v",
  "npsid_yearsed",
  "overall_domain_sum",
  "npsid_rep_moca_c",
  "npsid_rep_mmse_c",
  "attent_z_comp",
  "exec_z_comp",
  "visuosp_z_comp",
  "memory_z_comp",
  "language_z_comp",
  "st_ter_daed",
  "st_ter_leed",
  "updrs_3_on",
  "pc1",
  "pc2",
];

export const scatterplot_features_init: [string, string] = ["insnpsi_age", "visuosp_z_comp"];

export const pca_num_features_list: string[] = [
  "insnpsi_age",
  "npsid_ddur_v",
  "npsid_yearsed",
  "overall_domain_sum",
  "npsid_rep_moca_c",
  "npsid_rep_mmse_c",
  "attent_z_comp",
  "exec_z_comp",
  "visuosp_z_comp",
  "memory_z_comp",
  "language_z_comp",
];

export const biplot_features_init: string[] = [
  "npsid_ddur_v",
  // "insnpsi_age",
  "overall_domain_sum",
  // "visuosp_z_comp",
  // "exec_z_comp",
  "npsid_rep_mmse_c",
  "npsid_rep_moca_c",
  // "language_z_comp",
  // "attent_z_comp",
];
