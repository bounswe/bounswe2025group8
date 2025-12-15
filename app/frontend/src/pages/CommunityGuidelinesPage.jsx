import { useNavigate, Link as RouterLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "../hooks/useTheme";
import logoImage from "../assets/logo.png";

const CommunityGuidelinesPage = () => {
    const { colors, theme, setTheme } = useTheme();
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const Section = ({ title, children, className = "" }) => (
        <div className={`mb-8 ${className}`}>
            <h2
                className="text-2xl font-bold mb-4"
                style={{ color: colors.brand.primary }}
            >
                {title}
            </h2>
            {children}
        </div>
    );

    return (
        <div
            className="min-h-screen"
            style={{ backgroundColor: colors.background.primary }}
        >
            {/* Header - Similar to Login/Register pages but simplified */}
            <header className="p-4 flex justify-between items-center shadow-sm" style={{ backgroundColor: colors.background.secondary }}>
                <div className="flex items-center cursor-pointer" onClick={() => navigate("/")}>
                    <img src={logoImage} alt="Logo" className="w-10 h-10 mr-2" />
                    <h1
                        className="text-xl font-bold hidden sm:block"
                        style={{ color: colors.text.primary }}
                    >
                        Neighborhood Assistance Board
                    </h1>
                </div>

                <div className="flex gap-2">
                    <select
                        value={i18n.language}
                        onChange={(e) => i18n.changeLanguage(e.target.value)}
                        className="px-3 py-2 rounded-md border text-sm focus:outline-none"
                        style={{
                            backgroundColor: colors.background.primary,
                            color: colors.text.primary,
                            borderColor: colors.border.primary,
                        }}
                    >
                        <option value="en">{t("english")}</option>
                        <option value="tr">{t("turkish")}</option>
                    </select>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-4xl">
                <div
                    className="rounded-lg shadow-lg p-8"
                    style={{ backgroundColor: colors.background.secondary, color: colors.text.primary }}
                >
                    <div className="text-center mb-10">
                        <h1 className="text-4xl font-bold mb-4" style={{ color: colors.brand.primary }}>
                            {t("communityGuidelines.pageTitle")}
                        </h1>
                        <p className="text-lg leading-relaxed">
                            {t("communityGuidelines.introduction.welcome")}
                        </p>
                    </div>

                    <Section title="">
                        <p className="mb-4">{t("communityGuidelines.introduction.simpleIdea")}</p>
                        <p className="mb-4">{t("communityGuidelines.introduction.contribution")}</p>
                        <p className="mb-4">{t("communityGuidelines.introduction.goal")}</p>
                        <div className="p-4 rounded-md border-l-4" style={{ backgroundColor: colors.background.tertiary, borderColor: colors.brand.primary }}>
                            <p className="font-medium italic">{t("communityGuidelines.introduction.safety")}</p>
                        </div>
                    </Section>

                    <hr className="my-8 border-gray-200" style={{ borderColor: colors.border.primary }} />

                    <Section title={t("communityGuidelines.corePrinciples.title")}>
                        <div className="grid gap-6">
                            {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                                <div key={num} className="flex flex-col">
                                    <h3 className="text-xl font-semibold mb-2" style={{ color: colors.text.primary }}>
                                        {t(`communityGuidelines.corePrinciples.p${num}Title`)}
                                    </h3>
                                    <p style={{ color: colors.text.secondary }}>
                                        {t(`communityGuidelines.corePrinciples.p${num}Desc`)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </Section>

                    <hr className="my-8 border-gray-200" style={{ borderColor: colors.border.primary }} />

                    <Section title={t("communityGuidelines.contentRules.title")}>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="p-6 rounded-lg border" style={{ borderColor: colors.semantic.success, backgroundColor: `${colors.semantic.success}10` }}>
                                <h3 className="text-xl font-bold mb-4 flex items-center" style={{ color: colors.semantic.success }}>
                                    <span className="mr-2">✓</span> {t("communityGuidelines.contentRules.allowedTitle")}
                                </h3>
                                <ul className="list-disc pl-5 space-y-2" style={{ color: colors.text.primary }}>
                                    {t("communityGuidelines.contentRules.allowedList").split(";").map((item, index) => (
                                        <li key={index}>{item.trim()}</li>
                                    ))}
                                </ul>
                            </div>

                            <div className="p-6 rounded-lg border" style={{ borderColor: colors.semantic.error, backgroundColor: `${colors.semantic.error}10` }}>
                                <h3 className="text-xl font-bold mb-4 flex items-center" style={{ color: colors.semantic.error }}>
                                    <span className="mr-2">✕</span> {t("communityGuidelines.contentRules.notAllowedTitle")}
                                </h3>
                                <ul className="list-disc pl-5 space-y-2" style={{ color: colors.text.primary }}>
                                    {t("communityGuidelines.contentRules.notAllowedList").split(";").map((item, index) => (
                                        <li key={index}>{item.trim()}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </Section>

                    <hr className="my-8 border-gray-200" style={{ borderColor: colors.border.primary }} />

                    <Section title={t("communityGuidelines.responsibility.title")}>
                        <p className="text-lg" style={{ color: colors.text.primary }}>
                            {t("communityGuidelines.responsibility.desc")}
                        </p>
                    </Section>

                    <div className="mt-12 p-8 rounded-lg text-center" style={{ backgroundColor: colors.background.tertiary }}>
                        <h2 className="text-2xl font-bold mb-4" style={{ color: colors.brand.primary }}>
                            {t("communityGuidelines.thankYou.title")}
                        </h2>
                        <p className="text-lg">
                            {t("communityGuidelines.thankYou.desc")}
                        </p>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default CommunityGuidelinesPage;
