import { BookOpen } from "lucide-react";
import React, { useState } from "react";
import { CultureItem } from "../types";
import { FiestasAndCustoms } from "./FiestasAndCustoms";

interface CulturalGuideProps {
  cultureItems: CultureItem[];
  isDarkMode: boolean;
}

export const CulturalGuide: React.FC<CulturalGuideProps> = ({
  cultureItems,
}) => {
  const [activeTab, setActiveTab] = useState<"phrases" | "food" | "festivals">(
    "phrases",
  );
  const phrases = cultureItems.filter((c) => c.category === "phrase");
  const dishes = cultureItems.filter((c) => c.category === "dish");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/40 backdrop-blur-md">
              <BookOpen className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            </span>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Cultural Guide & Asi Language
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 mt-1 font-medium">
            Immerse yourself in Sibale Island traditions, explore documented Asi
            expressions, and savor local seafood.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none sm:flex-wrap max-w-full">
          {[
            { id: "phrases", label: "Asi Phrasebook 🗣️" },
            { id: "food", label: "Island Delicacies 🍲" },
            { id: "festivals", label: "Fiestas & Customs 🎉" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-full text-xs font-extrabold transition-all cursor-pointer backdrop-blur-md whitespace-nowrap shrink-0 ${
                activeTab === t.id
                  ? "bg-teal-500 text-slate-950 shadow-[0_0_15px_rgba(46,196,182,0.4)]"
                  : "bg-slate-200/80 hover:bg-slate-300/80 text-slate-800 border border-slate-300 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white dark:border-white/15"
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Phrasebook View */}
      {activeTab === "phrases" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl border border-teal-500/30 bg-teal-500/15 backdrop-blur-md text-teal-950 dark:text-teal-100">
            <p className="text-xs leading-relaxed">
              <strong>Published Asi expressions.</strong> These examples come
              from SIL’s 1985 Bantoanon (Asi) phrasebook. Spelling and usage may
              differ in Sibale; current local usage needs review by a Sibale
              speaker. Native-speaker audio is not yet available.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {phrases.map((item) => (
              <div
                key={item.id}
                className="p-5 rounded-3xl border border-slate-200/90 dark:border-white/15 bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl text-slate-900 dark:text-white flex items-start justify-between gap-4 transition-all hover:border-teal-500/60 hover:shadow-xl shadow-sm">
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-700 dark:text-teal-300">
                    Asi Phrase
                  </span>
                  <h3 className="text-xl font-black text-teal-900 dark:text-teal-300">
                    "{item.asiPhrase}"
                  </h3>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    English:{" "}
                    <span className="font-normal italic">
                      "{item.englishTranslation}"
                    </span>
                  </p>
                  <p className="text-[11px] text-teal-800 dark:text-teal-200">
                    {item.evidenceLabel}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-200 dark:border-white/10">
                    {item.detailText}
                  </p>
                  {item.sources?.map((source) => (
                    <a
                      key={source.url}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs underline text-teal-700 dark:text-teal-300">
                      {source.title}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Gastronomy View */}
      {activeTab === "food" && (
        <div className="space-y-5">
          <p className="p-4 rounded-2xl border border-teal-500/30 bg-teal-500/10 text-xs leading-relaxed text-teal-950 dark:text-teal-100">
            These foods are documented in Sibale’s local production and trade.
            They are shared Filipino foods, not exclusive island specialties.
            Photos illustrate the food, rather than a specific Sibale vendor’s
            product.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dishes.map((dish) => (
              <div
                key={dish.id}
                className="rounded-3xl border border-slate-200/90 dark:border-white/15 bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl overflow-hidden text-slate-900 dark:text-white transition-all hover:border-teal-500/60 hover:shadow-xl shadow-sm">
                {dish.image && (
                  <div className="h-60 p-3 overflow-hidden bg-slate-50 dark:bg-slate-800/40">
                    <img
                      src={dish.image}
                      alt={`Representative photo of ${dish.title}`}
                      loading="lazy"
                      className="w-full h-full object-contain rounded-xl"
                    />
                  </div>
                )}
                <div className="p-6 space-y-2">
                  <span className="text-xs font-black text-teal-700 dark:text-teal-300 uppercase tracking-widest">
                    Documented Local Food
                  </span>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {dish.title}
                  </h3>
                  {dish.evidenceLabel && (
                    <p className="text-[11px] text-teal-800 dark:text-teal-200">
                      {dish.evidenceLabel}
                    </p>
                  )}
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {dish.description}
                  </p>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-300 mt-2 backdrop-blur-md">
                    {dish.detailText}
                  </div>
                  {dish.sources?.map((source) => (
                    <a
                      key={source.url}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block pt-2 text-xs underline text-teal-700 dark:text-teal-300">
                      {source.title}
                    </a>
                  ))}
                  {dish.photoCredit && (
                    <div className="pt-3 border-t border-slate-200 dark:border-white/10 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                      <p>{dish.photoCredit.caption}</p>
                      <p>
                        Photo:{" "}
                        <a
                          href={dish.photoCredit.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline">
                          {dish.photoCredit.name} / Wikimedia Commons
                        </a>{" "}
                        ·{" "}
                        <a
                          href={dish.photoCredit.licenseUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline">
                          {dish.photoCredit.license}
                        </a>
                      </p>
                    </div>
                  )}
                  {dish.verifiedAt && (
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Source checked {dish.verifiedAt}.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Festivals & Customs View */}
      {activeTab === "festivals" && (
        <FiestasAndCustoms cultureItems={cultureItems} />
      )}
    </div>
  );
};
