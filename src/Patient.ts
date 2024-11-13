// import * as fs from 'fs';

export class Patient {
    [key: string]: any; // TODO, not really clean, but it works!
    // [key: string]: number | string | undefined;
    record_id: number = -1;
    mh_diagnosis: string = "StandardValue";
    npsi_cl_visit_n: number = -1;
    npsid_visits: number = -1;
    npsid_data_npsi: string = "";
    npsid_bdate: string = "";
    ins_npsi_sex: number = -1;
    insnpsi_age: number = -1;
    npsid_rep_moca_c: number = -1;
    npsid_rep_mmse_c: number = -1;
    cog_lev_def_2: string = "";
    cog_lev_def: string = "";
    npsid_cog_status: number = -1;
    npsid_ddur_v: number = -1;
    npsid_age_of_onset: number = -1;
    attent_z_comp: number = -1;
    exec_z_comp: number = -1;
    visuosp_z_comp: number = -1;
    memory_z_comp: number = -1;
    language_z_comp: number = -1;
    npsid_age_v: number = -1;
    attent_sum: number = -1;
    attent_sum_z: number = -1;
    exec_sum: number = -1;
    exec_sum_z: number = -1;
    visuosp_sum: number = -1;
    visuosp_sum_z: number = -1;
    memory_sum: number = -1;
    memory_sum_z: number = -1;
    language_sum: number = -1;
    language_sum_z: number = -1;
    overall_domain_sum: number = -1;
    z_diagnosis: string = "";
    reg_death_s: string = "";
    npsi_firstdiag: number = -1;
    npsi_time_last_v: string = "";
    npsid_datscan_not_av: number = -1;
    npsid_datscan_not_av_data: string = "";
    npsid_datscan_not_av_pos: string = "";
    npsid_datscan_not_av_pos_hem: string = "";
    npsid_rm: number = -1;
    npsid_rm_date: string = "";
    npsid_rm_id: string = "";
    free_surfer_codes: string = "";
    nspid_rm_protocol: string = "";
    npsid_rm2: number = -1;
    npsid_rm_date2: string = "";
    npsid_rm_id2: string = "";
    free_surfer_codes2: string = "";
    nspid_rm_protocol2: string = "";
    npsid_rm3: number = -1;
    npsid_rm_date3: string = "";
    npsid_rm_id3: string = "";
    free_surfer_codes3: string = "";
    npsid_yearsed: number = -1;
    npsid_educ_range: string = "";
    npsid_age_range: string = "";
    npsid_ddur_range: string = "";
    corsi_done: number = -1;
    digit_span_done: number = -1;
    dot_score_done: number = -1;
    dot_span_done: number = -1;
    rc_score_done: number = -1;
    tmt_a_done: number = -1;
    tmt_b_done: number = -1;
    sdmt_done: number = -1;
    flu_a_done: number = -1;
    stroop_t_done: number = -1;
    stroop_e_done: number = -1;
    cdt_done: number = -1;
    fab_done: number = -1;
    cdt_old_done: number = -1;
    phon_flu_done: number = -1;
    flu_f_done: number = -1;
    similarities_done: number = -1;
    sim_w4_done: number = -1;
    rocf_c_done: number = -1;
    benton_done: number = -1;
    vosp_done: number = -1;
    wpat_done: number = -1;
    rocf_d_done: number = -1;
    mprosa_i_done: number = -1;
    mprosa_d_done: number = -1;
    bab_t_done: number = -1;
    ravlt_t_done: number = -1;
    cat_flu_done: number = -1;
    naming_done: number = -1;
    flu_s_done: number = -1;
    boston_done: number = -1;
    set_gs_done: number = -1;
    soc_cog_sum: number = -1;
    updrs_3_on: number = -1;
    ma_subit_hy_on: number = -1;
    st_ter_no_calc_leed: number = -1;
    st_ter_leed: number = -1;
    st_ter_no_calc_daed: number = -1;
    st_ter_daed: number = -1;

    static fromJson(json: any): Patient {
        const patient = new Patient();
        for (const key in json) {
            if (Object.prototype.hasOwnProperty.call(json, key)) {
                if (typeof patient[key] === "number") {
                    patient[key] = parseFloat(json[key]);
                } else {
                    patient[key] = json[key];
                }
            }
        }
        return patient;
    }

    toString(): string {
        return `Patient ${this.record_id} (${this.mh_diagnosis})`;
    }

    get_record_id(): number {
        return this.record_id;
    }
}

// const csvFilePath = '/path/to/your/csv/file.csv';
// const csvData = fs.readFileSync(csvFilePath, 'utf-8');
// const lines = csvData.split('\n');
// const header = lines[0].split(',');
// const data = lines[1].split(',');

// const patientData: any = {};
// for (let i = 0; i < header.length; i++) {
//   patientData[header[i]] = data[i];
// }

// const patient = Patient.fromJson(patientData);
// console.log(patient);
