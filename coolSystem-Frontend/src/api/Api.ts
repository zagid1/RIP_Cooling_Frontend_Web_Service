/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface DsCartBadgeDTO {
  cooling_id?: number;
  count?: number;
}

export type DsComponentCreateRequest = object;

export interface DsComponentDTO {
  description?: string;
  id?: number;
  image_url?: string;
  status?: boolean;
  /** Specifications pq.StringArray `json:"specifications"` */
  tdp?: number;
  title?: string;
}

export interface DsComponentInRequest {
  component_id?: number;
  count?: number;
  description?: string;
  image_url?: string;
  /** Specifications pq.StringArray `json:"specifications"` */
  tdp?: number;
  title?: string;
}

export interface DsComponentToCoolingUpdateRequest {
  count?: number;
}

export interface DsComponentUpdateRequest {
  description?: string;
  /** Specifications pq.StringArray `json:"specifications"` */
  tdp?: number;
  title?: string;
}

export interface DsCoolingDTO {
  completion_date?: string;
  components?: DsComponentInRequest[];
  cooling_power?: number;
  creation_date?: string;
  creator_id?: number;
  forming_date?: string;
  id?: number;
  moderator_id?: number;
  room_area?: number;
  room_height?: number;
  status?: number;
}

export interface DsCoolingResolveRequest {
  /** "complete" | "reject" */
  action: string;
}

export interface DsCoolingUpdateRequest {
  room_area?: number;
  room_height?: number;
}

export interface DsLoginResponse {
  token?: string;
  user?: DsUserDTO;
}

export interface DsPaginatedResponse {
  items?: any;
  total?: number;
}

export interface DsUserDTO {
  full_name?: string;
  id?: number;
  moderator?: boolean;
  username?: string;
}

export interface DsUserLoginRequest {
  password: string;
  username: string;
}

export interface DsUserRegisterRequest {
  full_name: string;
  password: string;
  username: string;
}

export interface DsUserUpdateRequest {
  full_name?: string;
  password?: string;
  username?: string;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title API для системы CoolingSystems
 * @version 1.0
 * @contact API Support <support@example.com>
 *
 * API-сервер для управления заявками и компонентами серверов в системе CoolingSystems.
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  auth = {
    /**
     * @description Получение JWT токена по логину и паролю для доступа к защищенным эндпоинтам.
     *
     * @tags auth
     * @name LoginCreate
     * @summary Аутентификация пользователя (все)
     * @request POST:/auth/login
     * @response `200` `DsLoginResponse` OK
     * @response `400` `Record<string,string>` Ошибка валидации
     * @response `401` `Record<string,string>` Неверные учетные данные
     */
    loginCreate: (
      credentials: DsUserLoginRequest,
      params: RequestParams = {},
    ) =>
      this.request<DsLoginResponse, Record<string, string>>({
        path: `/auth/login`,
        method: "POST",
        body: credentials,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Добавляет текущий JWT токен в черный список, делая его недействительным. Требует авторизации.
     *
     * @tags auth
     * @name LogoutCreate
     * @summary Выход из системы (авторизованный пользователь)
     * @request POST:/auth/logout
     * @secure
     * @response `200` `Record<string,string>` Сообщение об успехе
     * @response `401` `Record<string,string>` Необходима авторизация
     */
    logoutCreate: (params: RequestParams = {}) =>
      this.request<Record<string, string>, Record<string, string>>({
        path: `/auth/logout`,
        method: "POST",
        secure: true,
        ...params,
      }),
  };
  components = {
    /**
     * @description Возвращает постраничный список компонентов системы охлаждения.
     *
     * @tags components
     * @name ComponentsList
     * @summary Получить список компонентов (все)
     * @request GET:/components
     * @response `200` `DsPaginatedResponse` OK
     * @response `500` `Record<string,string>` Внутренняя ошибка сервера
     */
    componentsList: (
      query?: {
        /** Фильтр по названию компонента */
        title?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<DsPaginatedResponse, Record<string, string>>({
        path: `/components`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Создает новую запись о компоненте системы охлаждения.
     *
     * @tags components
     * @name ComponentsCreate
     * @summary Создать новый компонент (только модератор)
     * @request POST:/components
     * @secure
     * @response `201` `DsComponentDTO` Created
     * @response `400` `Record<string,string>` Ошибка валидации
     * @response `401` `Record<string,string>` Необходима авторизация
     * @response `403` `Record<string,string>` Доступ запрещен (не модератор)
     */
    componentsCreate: (
      componentData: DsComponentCreateRequest,
      params: RequestParams = {},
    ) =>
      this.request<DsComponentDTO, Record<string, string>>({
        path: `/components`,
        method: "POST",
        body: componentData,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Возвращает детальную информацию о компоненте системы охлаждения.
     *
     * @tags components
     * @name ComponentsDetail
     * @summary Получить один компонент по ID (все)
     * @request GET:/components/{id}
     * @response `200` `DsComponentDTO` OK
     * @response `404` `Record<string,string>` Компонент не найден
     */
    componentsDetail: (id: number, params: RequestParams = {}) =>
      this.request<DsComponentDTO, Record<string, string>>({
        path: `/components/${id}`,
        method: "GET",
        format: "json",
        ...params,
      }),

    /**
     * @description Обновляет информацию о существующем компоненте системы охлаждения.
     *
     * @tags components
     * @name ComponentsUpdate
     * @summary Обновить компонент (только модератор)
     * @request PUT:/components/{id}
     * @secure
     * @response `200` `DsComponentDTO` OK
     * @response `400` `Record<string,string>` Ошибка валидации
     * @response `401` `Record<string,string>` Необходима авторизация
     * @response `403` `Record<string,string>` Доступ запрещен
     */
    componentsUpdate: (
      id: number,
      updateData: DsComponentUpdateRequest,
      params: RequestParams = {},
    ) =>
      this.request<DsComponentDTO, Record<string, string>>({
        path: `/components/${id}`,
        method: "PUT",
        body: updateData,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Удаляет компонент системы охлаждения из системы.
     *
     * @tags components
     * @name ComponentsDelete
     * @summary Удалить компонент (только модератор)
     * @request DELETE:/components/{id}
     * @secure
     * @response `204` `void` No Content
     * @response `401` `Record<string,string>` Необходима авторизация
     * @response `403` `Record<string,string>` Доступ запрещен
     */
    componentsDelete: (id: number, params: RequestParams = {}) =>
      this.request<void, Record<string, string>>({
        path: `/components/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * @description Загружает и привязывает изображение к компоненту системы охлаждения.
     *
     * @tags components
     * @name ImageCreate
     * @summary Загрузить изображение для компонента (только модератор)
     * @request POST:/components/{id}/image
     * @secure
     * @response `200` `Record<string,string>` URL загруженного изображения
     * @response `400` `Record<string,string>` Файл не предоставлен
     * @response `401` `Record<string,string>` Необходима авторизация
     * @response `403` `Record<string,string>` Доступ запрещен
     */
    imageCreate: (
      id: number,
      data: {
        /** Файл изображения */
        file: File;
      },
      params: RequestParams = {},
    ) =>
      this.request<Record<string, string>, Record<string, string>>({
        path: `/components/${id}/image`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.FormData,
        format: "json",
        ...params,
      }),
  };
  cooling = {
    /**
     * @description Возвращает отфильтрованный список всех сформированных заявок (кроме черновиков и удаленных).
     *
     * @tags cooling
     * @name CoolingList
     * @summary Получить список заявок (авторизованный пользователь)
     * @request GET:/cooling
     * @secure
     * @response `200` `(DsCoolingDTO)[]` OK
     * @response `401` `Record<string,string>` Необходима авторизация
     */
    coolingList: (
      query?: {
        /** Фильтр по статусу заявки */
        status?: number;
        /** Фильтр по дате 'от' (формат YYYY-MM-DD) */
        from?: string;
        /** Фильтр по дате 'до' (формат YYYY-MM-DD) */
        to?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<DsCoolingDTO[], Record<string, string>>({
        path: `/cooling`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Возвращает ID черновика текущего пользователя и количество компонентов в нем.
     *
     * @tags cooling
     * @name CoolcartList
     * @summary Получить информацию для иконки корзины (авторизованный пользователь)
     * @request GET:/cooling/coolcart
     * @secure
     * @response `200` `DsCartBadgeDTO` OK
     * @response `401` `Record<string,string>` Необходима авторизация
     */
    coolcartList: (params: RequestParams = {}) =>
      this.request<DsCartBadgeDTO, Record<string, string>>({
        path: `/cooling/coolcart`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Находит или создает черновик заявки для текущего пользователя и добавляет в него компонент.
     *
     * @tags components
     * @name DraftComponentsCreate
     * @summary Добавить компонент в черновик заявки (авторизованный пользователь)
     * @request POST:/cooling/draft/components/{component_id}
     * @secure
     * @response `201` `Record<string,string>` Сообщение об успехе
     * @response `401` `Record<string,string>` Необходима авторизация
     * @response `500` `Record<string,string>` Внутренняя ошибка сервера
     */
    draftComponentsCreate: (componentId: number, params: RequestParams = {}) =>
      this.request<Record<string, string>, Record<string, string>>({
        path: `/cooling/draft/components/${componentId}`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * @description Возвращает полную информацию о заявке, включая привязанные компоненты.
     *
     * @tags cooling
     * @name CoolingDetail
     * @summary Получить одну заявку по ID (авторизованный пользователь)
     * @request GET:/cooling/{id}
     * @secure
     * @response `200` `DsCoolingDTO` OK
     * @response `401` `Record<string,string>` Необходима авторизация
     * @response `404` `Record<string,string>` Заявка не найдена
     */
    coolingDetail: (id: number, params: RequestParams = {}) =>
      this.request<DsCoolingDTO, Record<string, string>>({
        path: `/cooling/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Позволяет пользователю обновить поля своей заявки (площадь помещения, высота помещения).
     *
     * @tags cooling
     * @name CoolingUpdate
     * @summary Обновить данные заявки (авторизованный пользователь)
     * @request PUT:/cooling/{id}
     * @secure
     * @response `204` `void` No Content
     * @response `401` `Record<string,string>` Необходима авторизация
     */
    coolingUpdate: (
      id: number,
      updateData: DsCoolingUpdateRequest,
      params: RequestParams = {},
    ) =>
      this.request<void, Record<string, string>>({
        path: `/cooling/${id}`,
        method: "PUT",
        body: updateData,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Логически удаляет заявку, переводя ее в статус "удалена".
     *
     * @tags cooling
     * @name CoolingDelete
     * @summary Удалить заявку (авторизованный пользователь)
     * @request DELETE:/cooling/{id}
     * @secure
     * @response `204` `void` No Content
     * @response `401` `Record<string,string>` Необходима авторизация
     */
    coolingDelete: (id: number, params: RequestParams = {}) =>
      this.request<void, Record<string, string>>({
        path: `/cooling/${id}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * @description Изменяет количество конкретного компонента в рамках одной заявки.
     *
     * @tags m-m
     * @name ComponentsUpdate
     * @summary Обновить количество компонента в заявке (авторизованный пользователь)
     * @request PUT:/cooling/{id}/components/{component_id}
     * @secure
     * @response `204` `void` No Content
     * @response `401` `Record<string,string>` Необходима авторизация
     */
    componentsUpdate: (
      id: number,
      componentId: number,
      updateData: DsComponentToCoolingUpdateRequest,
      params: RequestParams = {},
    ) =>
      this.request<void, Record<string, string>>({
        path: `/cooling/${id}/components/${componentId}`,
        method: "PUT",
        body: updateData,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),

    /**
     * @description Удаляет связь между заявкой и компонентом.
     *
     * @tags m-m
     * @name ComponentsDelete
     * @summary Удалить компонент из заявки (авторизованный пользователь)
     * @request DELETE:/cooling/{id}/components/{component_id}
     * @secure
     * @response `204` `void` No Content
     * @response `401` `Record<string,string>` Необходима авторизация
     */
    componentsDelete: (
      id: number,
      componentId: number,
      params: RequestParams = {},
    ) =>
      this.request<void, Record<string, string>>({
        path: `/cooling/${id}/components/${componentId}`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * @description Переводит заявку из статуса "черновик" в "сформирована" и рассчитывает мощность охлаждения.
     *
     * @tags cooling
     * @name FormUpdate
     * @summary Сформировать заявку (авторизованный пользователь)
     * @request PUT:/cooling/{id}/form
     * @secure
     * @response `204` `void` No Content
     * @response `400` `Record<string,string>` Не все поля заполнены
     * @response `401` `Record<string,string>` Необходима авторизация
     */
    formUpdate: (id: number, params: RequestParams = {}) =>
      this.request<void, Record<string, string>>({
        path: `/cooling/${id}/form`,
        method: "PUT",
        secure: true,
        ...params,
      }),

    /**
     * @description Модератор завершает или отклоняет заявку системы охлаждения.
     *
     * @tags cooling
     * @name ResolveUpdate
     * @summary Завершить или отклонить заявку (только модератор)
     * @request PUT:/cooling/{id}/resolve
     * @secure
     * @response `204` `void` No Content
     * @response `401` `Record<string,string>` Необходима авторизация
     * @response `403` `Record<string,string>` Доступ запрещен
     */
    resolveUpdate: (
      id: number,
      action: DsCoolingResolveRequest,
      params: RequestParams = {},
    ) =>
      this.request<void, Record<string, string>>({
        path: `/cooling/${id}/resolve`,
        method: "PUT",
        body: action,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
  users = {
    /**
     * @description Создает нового пользователя в системе. По умолчанию роль "пользователь", не "модератор".
     *
     * @tags auth
     * @name UsersCreate
     * @summary Регистрация нового пользователя (все)
     * @request POST:/users
     * @response `201` `DsUserDTO` Created
     * @response `400` `Record<string,string>` Ошибка валидации
     * @response `500` `Record<string,string>` Внутренняя ошибка сервера
     */
    usersCreate: (
      credentials: DsUserRegisterRequest,
      params: RequestParams = {},
    ) =>
      this.request<DsUserDTO, Record<string, string>>({
        path: `/users`,
        method: "POST",
        body: credentials,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Возвращает публичные данные пользователя. Требует авторизации.
     *
     * @tags users
     * @name UsersDetail
     * @summary Получение данных пользователя по ID (авторизованный пользователь)
     * @request GET:/users/{id}
     * @secure
     * @response `200` `DsUserDTO` OK
     * @response `401` `Record<string,string>` Необходима авторизация
     * @response `404` `Record<string,string>` Пользователь не найден
     */
    usersDetail: (id: number, params: RequestParams = {}) =>
      this.request<DsUserDTO, Record<string, string>>({
        path: `/users/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Обновляет имя пользователя или пароль. Требует авторизации.
     *
     * @tags users
     * @name UsersUpdate
     * @summary Обновление данных пользователя (авторизованный пользователь)
     * @request PUT:/users/{id}
     * @secure
     * @response `204` `void` No Content
     * @response `400` `Record<string,string>` Ошибка валидации
     * @response `401` `Record<string,string>` Необходима авторизация
     * @response `500` `Record<string,string>` Внутренняя ошибка сервера
     */
    usersUpdate: (
      id: number,
      updateData: DsUserUpdateRequest,
      params: RequestParams = {},
    ) =>
      this.request<void, Record<string, string>>({
        path: `/users/${id}`,
        method: "PUT",
        body: updateData,
        secure: true,
        type: ContentType.Json,
        ...params,
      }),
  };
}
