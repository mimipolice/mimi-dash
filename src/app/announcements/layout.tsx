import AnnouncementsLayoutClient from "./layout-client";

export default function AnnouncementsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnnouncementsLayoutClient>{children}</AnnouncementsLayoutClient>;
}
