import { RefObject, useEffect } from "react";

export function useDetectOutsideClick(
  ref: RefObject<HTMLElement>,
  closeFn: () => any
) {
  useEffect(() => {
    /**
     * Close if clicked on outside of element
     */
    // [...ref.current.children].any(r => r.current.contains(event.target))
    function handleClickOutside(event: MouseEvent) {
      if (ref && ref.current && !ref.current.contains(event.target as Node)) {
        // console.log("You clicked outside of me!");
        closeFn();
      }
    }
    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, closeFn]);
}
