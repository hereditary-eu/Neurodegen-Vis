import { Patient } from "./Patient";

interface PCAProps {
    patients_data: Patient[];
    num_features: string[];
}

function PCA( {patients_data, num_features}: PCAProps ) { 
    return (
        <div>
        <h2>{patients_data[1].record_id}</h2>
        </div>
    );   
}
;

export default PCA;