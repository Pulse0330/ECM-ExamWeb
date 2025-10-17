export interface SorillistsResponseTye {
  ResponseMessage: string;
  StatusCode: string;
  ResponseCode: string;
  ResponseType: boolean;
}

export interface ExamData {
  exam_id: number;           
  soril_name: string;       
  sorildate: string;       
  minut: number;             
  que_cnt: number;           
  isguitset: number;         
  test_resid: number;        
  filename: string;        
  flag_name: string;        
  plan_id: number | null;   
  plan_name: string | null; 
}

// /types.ts


export interface ApiResponse {
  RetResponse: SorillistsResponseTye;
  RetData: ExamData[];
}
