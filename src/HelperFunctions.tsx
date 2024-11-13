import { Patient } from "./Patient";

interface MinMaxPatProps {
    y_feature: string;
    x_feature: string;
    patients_data: Patient[];
    categorical_feature: string;
    show_dash?: boolean;
    showCatLinReg?: boolean;
    showCatAvg?: boolean;
}

function CalcMinMaxPatientsData({
    y_feature,
    x_feature,
    patients_data,
    categorical_feature = "",
    show_dash = false,
}: MinMaxPatProps) {
    const min_x = Math.min(
        ...patients_data.map((p) => p[x_feature]).filter((d) => !isNaN(d))
    );
    const max_x = Math.max(
        ...patients_data.map((p) => p[x_feature]).filter((d) => !isNaN(d))
    );
    const min_y = Math.min(
        ...patients_data.map((p) => p[y_feature]).filter((d) => !isNaN(d))
    );
    const max_y = Math.max(
        ...patients_data.map((p) => p[y_feature]).filter((d) => !isNaN(d))
    );
    const x_range = max_x - min_x;
    const y_range = max_y - min_y;
    return [
        min_x - x_range * 0.05,
        max_x + x_range * 0.05,
        min_y - y_range * 0.05,
        max_y + y_range * 0.05,
    ];
}

interface MinMaxMatrixProps {
    matrix: number[];
    feature_1: number;
    feature_2: number;
}
function CalcMinMaxMatrix({ matrix, feature_1, feature_2 }: MinMaxMatrixProps) {
    const min_x = Math.min(
        ...matrix.map((p) => p[feature_1]).filter((d) => !isNaN(d))
    );
    const max_x = Math.max(
        ...matrix.map((p) => p[feature_1]).filter((d) => !isNaN(d))
    );
    const min_y = Math.min(
        ...matrix.map((p) => p[feature_2]).filter((d) => !isNaN(d))
    );
    const max_y = Math.max(
        ...matrix.map((p) => p[feature_2]).filter((d) => !isNaN(d))
    );
    const x_range = max_x - min_x;
    const y_range = max_y - min_y;
    return [
        min_x - x_range * 0.05,
        max_x + x_range * 0.05,
        min_y - y_range * 0.05,
        max_y + y_range * 0.05,
    ];
}

export { CalcMinMaxPatientsData, CalcMinMaxMatrix };
