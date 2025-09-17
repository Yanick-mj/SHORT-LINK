import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getShortLink } from '@/lib/utils';

const ShortLinkButton = ({ link, className = '', ariaLabel }) => {
  const navigate = useNavigate();
  const shortText = getShortLink(link);
  const code = link?.custom_url || link?.short_url || '';

  return (
    <button
      type="button"
      className={`${className} focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 rounded transition-colors duration-200 hover:underline text-left break-all min-h-[44px] min-w-[44px] flex items-center`}
      onClick={() => navigate(`/${code}`)}
      aria-label={ariaLabel || `Visiter le lien raccourci ${code}`}
    >
      {shortText}
    </button>
  );
};

export default ShortLinkButton;
