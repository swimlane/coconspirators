export function json() {
  return {
    subscribe: async (msg) => {
      if(msg.content) {
        const content = msg.content.toString();
        return JSON.parse(content);
      }
    },
    publish: async (msg) => {
      const json = JSON.stringify(msg);
      return new Buffer(json);
    }
  };
}
