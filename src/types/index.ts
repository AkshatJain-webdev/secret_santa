export interface Employee {
  Employee_Name: string;
  Employee_EmailID: string;
}

export interface SecretSantaAssignment extends Employee {
  Secret_Child_Name: string;
  Secret_Child_EmailID: string;
}

export interface CSVData {
  data: Employee[] | SecretSantaAssignment[];
  errors: any[];
  meta: {
    delimiter: string;
    linebreak: string;
    aborted: boolean;
    truncated: boolean;
    cursor: number;
  };
}
