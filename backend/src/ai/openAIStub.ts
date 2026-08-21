export default class OpenAI {
  chat = {
    completions: {
      create: async (params: any) => {
        return {
          choices: [{ message: { content: '{}' } }],
        };
      },
    },
  };
  constructor(options?: any) {}
}
