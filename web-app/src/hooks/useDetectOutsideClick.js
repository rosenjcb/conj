import { useEffect } from "react";

export function useDetectOutsideClick(ref, closeFn) {
  useEffect(() => {
    /**
     * Close if clicked on outside of element
     */
    // [...ref.current.children].any(r => r.current.contains(event.target))
    function handleClickOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
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
