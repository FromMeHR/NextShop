import Link from "next/link";
import css from "./Paginaton.module.css";

export function Pagination({ currentPage, totalItems, pageSize, searchParams, pathname }) {
  const totalPages = Math.ceil(totalItems / pageSize);
  if (totalPages <= 1) return null;

  const createUrl = (page) => {
    const params = new URLSearchParams(searchParams);
    const targetPage = Math.max(1, Math.min(totalPages, page));
    if (targetPage <= 1) {
      params.delete("page");
    } else {
      params.set("page", targetPage.toString());
    }
    const queryString = params.toString();
    return queryString ? `${pathname}?${queryString}` : pathname;
  };

  const renderItems = () => {
    const items = [];
    const buffer = 1;

    items.push(1);

    if (currentPage > buffer + 2) {
      items.push({ type: "jump-prev", target: currentPage - 3 });
    }

    const start = Math.max(2, currentPage - buffer);
    const end = Math.min(totalPages - 1, currentPage + buffer);

    for (let i = start; i <= end; i++) {
      items.push(i);
    }

    if (currentPage < totalPages - (buffer + 1)) {
      items.push({ type: "jump-next", target: currentPage + 3 });
    }

    if (totalPages > 1) {
      items.push(totalPages);
    }
    return items;
  };

  return (
    <ul className={css["pagination"]}>
      <li className={`${css["pagination-item"]} ${currentPage === 1 ? css["disabled"] : ""}`}>
        <Link href={createUrl(currentPage - 1)} aria-disabled={currentPage === 1} prefetch={false}>
          <div className={`${css["pagination__arrow"]} ${css["left"]}`}></div>
        </Link>
      </li>
      {renderItems().map((item, index) => {
        if (typeof item === "number") {
          return (
            <li
              key={index}
              className={`${css["pagination-item"]} ${item === currentPage ? css["active"] : ""}`}
            >
              <Link href={createUrl(item)} prefetch={false}>{item}</Link>
            </li>
          );
        }
        return (
          <li key={index} className={`${css["pagination-item"]} ${css["jump-item"]}`}>
            <Link href={createUrl(item.target)} prefetch={false}>
              <div className={css["jump-container"]}>
                <span className={css["ellipsis"]}>•••</span>
                <div className={`${css["pagination__double-arrow"]} ${item.type === "jump-prev" ? css["left"] : css["right"]}`}>
                </div>
              </div>
            </Link>
          </li>
        );
      })}
      <li className={`${css["pagination-item"]} ${currentPage === totalPages ? css["disabled"] : ""}`}>
        <Link href={createUrl(currentPage + 1)} aria-disabled={currentPage === totalPages} prefetch={false}>
          <div className={`${css["pagination__arrow"]} ${css["right"]}`}></div>
        </Link>
      </li>
    </ul>
  );
}
