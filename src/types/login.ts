export type LoginPayload = {
  username: string;
  password: string;
};

export interface LoginType {
  RetResponse: {
    ResponseMessage: string;
    StatusCode: string;
    ResponseCode: string;
    ResponseType: boolean;
  };
  RetData: number; 
}

export interface LoginData {
  profile: Profile;
  token: string;
}

export interface Profile {
  id: string; // "74588"
  login_name: string; // "ES4010065211"
  user_code?: string | null; // possibly null
  phone?: string | null;
  password: string; // hashed password
  fname?: string | null; // combined name?
  reg_number?: string | null; // "ТЕ93121111"
  email?: string | null; // e.g. "&nbsp;" or null
  lastname?: string | null; // "Ганбаатар"
  firstname?: string | null; // "Анхбаяр"
  school_id?: number | null; // 3157
  school_name?: string | null; // includes trailing tab in example
  img?: string | null; // "Modules/SysUsr/AvatarPhoto/01.png"
  expired_date?: string | null; // null or ISO date string
  expired?: number | null; // 0/1
  ugroup?: number | null; // 4
  personId?: string | null; // "90000001338849"
  ebarimtNum?: string | null;
}
