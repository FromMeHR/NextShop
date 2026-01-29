"use client";

import React from "react";
import { useCategories } from "../../../hooks/useCategories";
import Link from "next/link";
import css from "./Categories.module.css";

export function Categories() {
  const { categories } = useCategories();

  return (
    <div className={css["categories__main"]}>
      <div className={css["categories__content"]}>
        {categories && categories.length > 0 && (
          <div className={css["categories-grid"]} id="categories">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                href={category?.children?.length > 0 ? `/category/${category?.slug}` : `/catalog/${category?.slug}`}
                prefetch={false}
                style={{ gridArea: `box-${index + 1}` }}
                className={css["category__item"]}
              >
                <h2 className={css["category__item-name"]}>{category.name}</h2>
                <span className={css["category__item-image-wrapper"]}>
                  {category.image && <img src={category.image} alt={category.name} />}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
