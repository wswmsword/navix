import SideBar from "./components/side-bar";
import ReviewSongs from "./components/review-songs";
import MadeForU from "./components/made-for-u";
import MusicChips from "./components/music-chips";
import { lazy, Suspense, use, useEffect, useRef, useState } from "react";
import { FocusContext, type FocusContextType } from "./context";
import naviix from "naviix";
import { useDebouncedCallback } from "use-debounce";

const LazyParallaxes = lazy(() => import("./components/parallaxes"));

function App() {

  const fc = use(FocusContext) as FocusContextType;
  const focuXMap = fc.focuXMap;
  const curDir = fc?.curDir || { current: "" };
  const { setCurDir } = fc;
  const container = useRef<HTMLDivElement>(null);
  const debouncedFocux = useDebouncedCallback(
    // function
    updateFocuxMap,
    // delay in ms
    66
  );
  const [shouldLoadParallaxes, setSL] = useState(false);

  useEffect(() => {
    if (window.innerWidth > 765) {
      setSL(true);
    }

    debouncedFocux();

    setTimeout(() => {
      document.addEventListener("keydown", nav);
      document.addEventListener("keyup", keyUp);
    }, 16);

    const ro = new ResizeObserver(() => {
      debouncedFocux();
    });

    // 观察一个或多个元素
    ro.observe(container.current as HTMLDivElement);

    return () => {
      document.removeEventListener("keydown", nav);
      document.removeEventListener("keyup", keyUp);
    };
  }, []);

  return (
    <div className="flex h-full relative overflow-hidden" ref={container}>
      <div aria-hidden className={`absolute text-9xl font-bold text-[#1f2f4d] -bottom-6 right-3 italic pointer-events-none h z-0`}>Naviix</div>
      <h1 className={`absolute text-9xl font-bold text-[#1f2f4d] -bottom-6 right-3 italic hh z-0`}>Naviix</h1>
      <SideBar updateFocuxMap={debouncedFocux} />
      <div className="py-4 shrink min-w-0 grow overflow-y-auto z-1" onScroll={debouncedFocux}>
        <div className="max-w-[1188px] mx-auto">
          <MusicChips />
          <ReviewSongs updateFocuxMap={debouncedFocux} />
          <MadeForU />
        </div>
      </div>
      {shouldLoadParallaxes && <Suspense>
        <LazyParallaxes />
      </Suspense>}
    </div>
  );

  function nav(e: KeyboardEvent) {
    const cur = document.activeElement;
    const dirMap = new Map([
      ["ArrowDown", "d"],
      ["ArrowUp", "u"],
      ["ArrowLeft", "l"],
      ["ArrowRight", "r"],
    ])
    const next = focuXMap.current.get(cur);
    if (next == null && ["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      curDir.current = dirMap.get(e.key) as string;
      setCurDir(curDir.current || "");
      focuXMap.current.keys().next().value.focus();
    } else {
      if (next) {
        let nextE: HTMLButtonElement | null = null;
        curDir.current = dirMap.get(e.key) as string;
        setCurDir(curDir.current || "");
        if (e.key === "ArrowDown") {
          if (next.down) nextE = next.down.id;
        } else if (e.key === "ArrowUp") {
          if (next.up) nextE = next.up.id;
        } else if (e.key === "ArrowLeft") {
          if (next.left) nextE = next.left.id;
        } else if (e.key === "ArrowRight") {
          if (next.right) nextE = next.right.id;
        }
        if (nextE) {
          nextE.focus();
          fc.lastFocusedE.current = nextE;
        } else {
          const animeFocusHandlerRef = fc?.animeFocusHandlerRef;
          animeFocusHandlerRef?.current.get(cur?.parentElement as HTMLDivElement)?.();
        }
      }
    }
    if (["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault();
    }
  }

  function keyUp() {
    setCurDir("");
  }

  function updateFocuxMap() {
    const es = fc?.getFocusableElements().filter(e => e.offsetWidth !== 0);
    // const locs = (es || []).map(mapLoc).filter(item => item.loc[2] !== 0);
    // const listEs = fc?.groupElementsRef.current.get("list") || [];
    // const listLocs = listEs.map(mapLoc);
    // const config = {
    //   locs,
    //   subs: {
    //     wrap: listLocs.slice(-1)[0],
    //     locs: listLocs.slice(0, -1),
    //   }
    // };
    // focuXMap.current = naviix(config);
    focuXMap.current = naviix(es);
  }
}

export default App;
