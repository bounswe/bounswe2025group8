import { useTranslation } from 'react-i18next';
import { Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  
  const currentLang = i18n.language.startsWith('en') ? 'en' : i18n.language.startsWith('tr') ? 'tr' : i18n.language;

  const handleLanguageChange = (event: SelectChangeEvent) => {
    const lang = event.target.value;
    i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang); // Açıkça localStorage'a kaydet
  };

  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <InputLabel id="language-select-label">Language</InputLabel>
      <Select
        labelId="language-select-label"
        id="language-select"
        value={currentLang}
        label="Language"
        onChange={handleLanguageChange}
      >
        <MenuItem value="en">English</MenuItem>
        <MenuItem value="tr">Türkçe</MenuItem>
      </Select>
    </FormControl>
  );
};

// Alternatif: Button versiyonu
export const LanguageButtons = () => {
  const { i18n } = useTranslation();
  
  const currentLang = i18n.language.startsWith('en') ? 'en' : i18n.language.startsWith('tr') ? 'tr' : i18n.language;

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang); // Açıkça localStorage'a kaydet
  };

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <Button
        variant={currentLang === 'en' ? 'contained' : 'outlined'}
        onClick={() => handleLanguageChange('en')}
        size="small"
      >
        EN
      </Button>
      <Button
        variant={currentLang === 'tr' ? 'contained' : 'outlined'}
        onClick={() => handleLanguageChange('tr')}
        size="small"
      >
        TR
      </Button>
    </div>
  );
};
