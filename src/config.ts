declare global {
  var config: {
    status: {
      text: string;
      type: string;
    };
    devGuildIds: string[];
    devUserIds: string[];
    devRoleIds: string[];
  };
}

global.config = {
  status: {
    text: "Watching over the server",
    type: "WATCHING",
  },
  devGuildIds: ["1157101410710736946"],
  devUserIds: ["680957940647329829", "739219467455823921"],
  devRoleIds: ["1157101410710736950"],
};

export {};
