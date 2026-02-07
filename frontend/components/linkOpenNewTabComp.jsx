import React from "react";

// Компонент-кнопка для открытия ссылок в новой вкладке (используется для соц. сетей)
function LinkOpenNewTabComp({ url, children }) {
  function openInNewTab(_url) {
    window.open(_url, "_blank").focus();
  }

  return (
    <button
      type="button"
      onClick={() => openInNewTab(url)}
      className="inline-flex items-center justify-center w-10 h-10 text-xl text-[var(--text-secondary)] hover:text-blue-400 hover:bg-blue-400/10 border border-transparent hover:border-blue-400/30 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
      aria-label="Social link"
    >
      {children}
    </button>
  );
}

export default LinkOpenNewTabComp;
