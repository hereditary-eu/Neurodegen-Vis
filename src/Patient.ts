export class Patient {
  record_id: string | null = null;
  mh_diagnosis: string | null = null;
  npsi_cl_visit_n: string | null = null;
  npsid_visits: string | null = null;
  npsid_data_npsi: string | null = null;
  npsid_bdate: string | null = null;
  ins_npsi_sex: string | null = null;
  insnpsi_age: string | null = null;
  npsid_rep_moca_c: string | null = null;
  npsid_rep_mmse_c: string | null = null;
  cog_lev_def_2: string | null = null;
  cog_lev_def: string | null = null;
  npsid_cog_status: string | null = null;
  npsid_ddur_v: string | null = null;
  npsid_age_of_onset: string | null = null;
  attent_z_comp: string | null = null;
  exec_z_comp: string | null = null;
  visuosp_z_comp: string | null = null;
  memory_z_comp: string | null = null;
  language_z_comp: string | null = null;
  npsid_age_v: string | null = null;
  attent_sum: string | null = null;
  attent_sum_z: string | null = null;
  exec_sum: string | null = null;
  exec_sum_z: string | null = null;
  visuosp_sum: string | null = null;
  visuosp_sum_z: string | null = null;
  memory_sum: string | null = null;
  memory_sum_z: string | null = null;
  language_sum: string | null = null;
  language_sum_z: string | null = null;
  overall_domain_sum: string | null = null;
  z_diagnosis: string | null = null;
  reg_death_s: string | null = null;
  npsi_firstdiag: string | null = null;
  npsi_time_last_v: string | null = null;
  npsid_datscan_not_av: string | null = null;
  npsid_datscan_not_av_data: string | null = null;
  npsid_datscan_not_av_pos: string | null = null;
  npsid_datscan_not_av_pos_hem: string | null = null;
  npsid_rm: string | null = null;
  npsid_rm_date: string | null = null;
  npsid_rm_id: string | null = null;
  free_surfer_codes: string | null = null;
  nspid_rm_protocol: string | null = null;
  npsid_rm2: string | null = null;
  npsid_rm_date2: string | null = null;
  npsid_rm_id2: string | null = null;
  free_surfer_codes2: string | null = null;
  nspid_rm_protocol2: string | null = null;
  npsid_rm3: string | null = null;
  npsid_rm_date3: string | null = null;
  npsid_rm_id3: string | null = null;
  free_surfer_codes3: string | null = null;
  npsid_yearsed: string | null = null;
  npsid_educ_range: string | null = null;
  npsid_age_range: string | null = null;
  npsid_ddur_range: string | null = null;
  corsi_done: string | null = null;
  digit_span_done: string | null = null;
  dot_score_done: string | null = null;
  dot_span_done: string | null = null;
  rc_score_done: string | null = null;
  tmt_a_done: string | null = null;
  tmt_b_done: string | null = null;
  sdmt_done: string | null = null;
  flu_a_done: string | null = null;
  stroop_t_done: string | null = null;
  stroop_e_done: string | null = null;
  cdt_done: string | null = null;
  fab_done: string | null = null;
  cdt_old_done: string | null = null;
  phon_flu_done: string | null = null;
  flu_f_done: string | null = null;
  similarities_done: string | null = null;
  sim_w4_done: string | null = null;
  rocf_c_done: string | null = null;
  benton_done: string | null = null;
  vosp_done: string | null = null;
  wpat_done: string | null = null;
  rocf_d_done: string | null = null;
  mprosa_i_done: string | null = null;
  mprosa_d_done: string | null = null;
  bab_t_done: string | null = null;
  ravlt_t_done: string | null = null;
  cat_flu_done: string | null = null;
  naming_done: string | null = null;
  flu_s_done: string | null = null;
  boston_done: string | null = null;
  set_gs_done: string | null = null;
  soc_cog_sum: string | null = null;
  updrs_3_on: string | null = null;
  ma_subit_hy_on: string | null = null;
  st_ter_no_calc_leed: string | null = null;
  st_ter_leed: string | null = null;
  st_ter_no_calc_daed: string | null = null;
  st_ter_daed: string | null = null;

  static fromJson(json: any): Patient {
    const patient = new Patient();
    for (const key in json) {
      if (Object.prototype.hasOwnProperty.call(json, key)) {
        patient[key] = json[key];
      }
    }
    return patient;
  }

  toString(): string {
    return `Patient ${this.record_id} (${this.mh_diagnosis})`;
  }
}
