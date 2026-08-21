declare module 'cors' {
  import { RequestHandler } from 'express';
  function cors(options?: any): RequestHandler;
  export default cors;
}

declare module 'helmet' {
  import { RequestHandler } from 'express';
  function helmet(options?: any): RequestHandler;
  export default helmet;
}

declare module 'cookie-parser' {
  import { RequestHandler } from 'express';
  function cookieParser(secret?: any, options?: any): RequestHandler;
  export default cookieParser;
}

declare module 'openai' {
  export default class OpenAI {
    constructor(options?: any);
    chat: {
      completions: {
        create(params: any): Promise<any>;
      };
    };
  }
}
