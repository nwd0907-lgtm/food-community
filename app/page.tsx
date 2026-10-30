import { AppBottomNavigation } from "./_components/AppBottomNavigation";
import { HomeDiscover } from "./_components/HomeDiscover";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col pb-[calc(56px+var(--app-install-banner-height))] lg:pb-0">
      <HomeDiscover />
      <AppBottomNavigation current="home" />
    </div>
  );
}
