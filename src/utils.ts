const massageString = (value: string): string => {
  value = /^\"(.+)\"$/.test(value) ? value.slice(1, -1) : value;
  return value.trim();
}

const massageNumber = (value: string|number): number => typeof value === 'number' ? value : Number(value);

export const extractBannerData = (frontmatter: Record<string, any>): BannerMetadata => {
  return {
    src: frontmatter?.banner ? massageString(frontmatter.banner) : undefined,
    x: frontmatter?.banner_x ? massageNumber(frontmatter.banner_x) : undefined,
    y: frontmatter?.banner_y ? massageNumber(frontmatter.banner_y) : undefined
  };
};
