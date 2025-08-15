const appConfig = {
  metadata: {
    title: "MimiDLC",
    description:
      "Lolidactyl is an open-source Pterodactyl client area that provides a simple and user-friendly interface with powerful features. Yes not MimiDLC.",
    openGraph: {
      title: "MimiDLC",
      description:
        "Lolidactyl is an open-source Pterodactyl client area that provides a simple and user-friendly interface with powerful features. Yes not MimiDLC.",
      url: "https://mimi.n1cat.xyz",
      siteName: "MimiDLC",
      images: [
        {
          url: "/images/bg/home.jpg",
          width: 1200,
          height: 630,
        },
      ],
      type: "website",
    },
  },
  limit: {
    cpu: {
      min: 5,
      max: 400,
      step: 5,
      default: 5,
    },
    ram: {
      min: 128,
      max: 16384,
      step: 128,
      default: 128,
    },
    disk: {
      min: 128,
      max: 32768,
      step: 128,
      default: 128,
    },
    databases: {
      min: 0,
      max: 10,
      step: 1,
      default: 0,
    },
    backups: {
      min: 0,
      max: 10,
      step: 1,
      default: 0,
    },
    allocations: {
      min: 0,
      max: 5,
      step: 1,
      default: 0,
    },
  },
  ads: [
    {
      id: 1,
      title: "Lolidactyl",
      description: "幫這個專案點顆星星嗎？",
      imageUrl:
        "https://static.wikia.nocookie.net/windows/images/0/01/GitHub_logo_2013.png/revision/latest?cb=20231201024220",
      linkUrl: "https://github.com/SHD-Development/lolidactyl",
      isActive: true,
    },
    {
      id: 2,
      title: "聽說...",
      description: "聽說honkomagake其實是小男娘？！",
      imageUrl: "/images/ads/image.png",
      linkUrl: "https://github.com/SHD-Development/lolidactyl",
      isActive: true,
    },
  ],
  admins: (() => {
    const adminsEnv = process.env.ADMINS;
    if (!adminsEnv) {
      return [];
    }
    try {
      const parsedAdmins = adminsEnv
        .split(",")
        .map((adminString) => {
          const parts = adminString.split(":");
          const id = parts[0]?.trim();
          const email = parts[1]?.trim();
          if (!id || !email) {
            return null;
          }
          return { id, email };
        })
        .filter(
          (admin): admin is { id: string; email: string } => admin !== null
        );
      return parsedAdmins;
    } catch (e) {
      console.warn(
        `[WARN] Could not parse ADMINS environment variable. Please ensure it is in the format "id1:email1,id2:email2". Falling back to an empty array.`,
        `Value: "${adminsEnv}"`,
        `Error: ${(e as Error).message}`
      );
      return [];
    }
  })(),
  botInviteLinks: {
    mimiDLC:
      "https://discord.com/oauth2/authorize?client_id=1393808249035165706",
    mimiPolice:
      "https://discord.com/oauth2/authorize?client_id=1221230734602141727",
  },
};
export default appConfig;
