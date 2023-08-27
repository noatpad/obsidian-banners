import type { BannerMetadata } from "./types";

export const extractBannerData = (frontmatter: Record<string, any>): BannerMetadata => {
  return {
    src: frontmatter?.banner,
    x: frontmatter?.banner_x,
    y: frontmatter?.banner_y
  };
};
