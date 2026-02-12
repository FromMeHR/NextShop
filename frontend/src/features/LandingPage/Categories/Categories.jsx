import React from "react";
import Link from "next/link";
import css from "./Categories.module.css";

export function Categories({ categories }) {
  return (
    <div className={css["categories__main"]}>
      <div className={css["categories__content"]}>
        <div className={css["categories-grid"]} id="categories">
        {categories.map((category, index) => (
          <article
            key={category.id}
            className={css["category__item"]}
            style={{ gridArea: `box-${index + 1}` }}
          >
            <Link
              href={category?.children?.length > 0 ? `/category/${category?.slug}` : `/catalog/${category?.slug}`}
              prefetch={false}
              className={css["category__link"]}
            >
              <h2 className={css["category__item-name"]}>{category.name}</h2>
              <span className={css["category__item-image-wrapper"]}>
                {category.image && <img src={category.image} alt={category.name} />}
              </span>
            </Link>
          </article>
        ))}
        </div>
      </div>
    </div>
  );
}
