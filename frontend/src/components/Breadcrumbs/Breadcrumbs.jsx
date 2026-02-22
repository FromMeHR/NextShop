import React from "react";
import Link from "next/link";
import css from "./Breadcrumbs.module.css";

export const Breadcrumbs = ({ items = [] }) => {
  const baseItems = [{ name: "Головна", href: "/" }];
  const allItems = [...baseItems, ...items];

  return (
    <nav className={css["breadcrumb-wrapper"]} aria-label="breadcrumb">
     <ul
        className={css["breadcrumb"]}
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        {allItems.map((item, index) => (
          <React.Fragment key={index}>
            {item?.name && (
              <li
                itemProp="itemListElement"
                itemScope
                itemType="https://schema.org/ListItem"
              >
                {!item?.href ? (
                  <span itemProp="name" aria-current="page">{item.name}</span>
                ) : (
                  <Link href={item.href} itemProp="item" prefetch={false}>
                    <span itemProp="name">{item.name}</span>
                  </Link>
                )}
                <meta itemProp="position" content={index + 1} />
              </li>
            )}
          </React.Fragment>
        ))}
      </ul>
    </nav>
  );
};
