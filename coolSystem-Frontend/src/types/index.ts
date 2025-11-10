export interface IComponent {
  id: number;
  title: string;
  description: string;
  tdp: number;  // Thermal Design Power
  image_url?: string;
  status: boolean;
  specifications?: string[];  // Спецификации компонента
}

export interface IPaginatedComponents {
  items: IComponent[];
  total: number;
}

export interface Icooling {
  id: number;
  status: number;  // 1-черновик, 2-удален, 3-сформирован, 4-завершен, 5-отклонен
  creation_date: string;
  room_area?: number;
  room_height?: number;
  cooling_power?: number;
  components: IComponentToRequest[];
}

export interface IComponentToRequest {
  component_id: number;
  count: number;
  component?: IComponent;
}

export interface ICrumb {
  label: string;
  path?: string;
  active?: boolean;
}