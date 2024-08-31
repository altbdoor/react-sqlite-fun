import { HTMLProps } from "react";

export const anchorClick = (attr: HTMLProps<HTMLAnchorElement>) => {
  const a = document.createElement("a");
  document.body.appendChild(a);

  Object.entries(attr).forEach(([key, value]) => {
    a.setAttribute(key, `${value}`);
  });

  a.addEventListener("click", () => {
    setTimeout(() => {
      document.body.removeChild(a);
    }, 500);
  });
  a.click();
};
