// Route-to-route transition: the template remounts on every navigation, so a
// CSS animation on this wrapper replays each time. No JavaScript, transform
// only, so the page is painted before hydration and the largest paint is
// never held back.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
