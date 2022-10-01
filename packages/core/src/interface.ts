export interface IConnectionStringAtomProps {
  host: string;
  username: string;
  password: string;
  virtualHost: string;
  port: number | string;
}

export interface IConnectionStringProps {
  uri: string;
}
