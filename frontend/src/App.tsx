import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

type ViewMode = "offers" | "dashboard";
type SortCategory = "none" | "safety" | "economy" | "quality_of_life" | "culture";

type CityScore = {
  safety: number;
  economy: number;
  qualityOfLife?: number;
  quality_of_life?: number;
  culture: number;
  totalScore?: number;
};

type CityNews = {
  id?: string;
  title?: string;
  content?: string;
  createdAt?: number;
  city?: string;
  country?: string;
};

type Offer = {
  _id?: string;
  id?: string;
  title?: string;
  company?: string;
  link?: string;
  city?: string;
  domain?: string;
  salary?: number;
  startDate?: string;
  endDate?: string;
  cityScore?: CityScore | null;
  news?: CityNews[];
};

type Student = {
  id: number;
  firstname: string;
  name: string;
  domain: string;
};

type RecommendedOffersResponse = {
  student: Student;
  offers: Offer[];
};

type InternshipResponse = {
  id: number;
  status: string;
  message: string;
};

type ApplicationFeedback = {
  status: string;
  message: string;
};

const API_BASE_URL = typeof window !== 'undefined' && window.location ? 
  `http://${window.location.hostname}:3000` : 
  (import.meta.env.VITE_API_BASE_URL ?? "");

const sortToApi: Record<Exclude<SortCategory, "none">, string> = {
  safety: "safety",
  economy: "economy",
  quality_of_life: "qualityOfLife",
  culture: "culture"
};

export default function App() {
  const [view, setView] = useState<ViewMode>("offers");

  const [offers, setOffers] = useState<Offer[]>([]);
  const [offersLoading, setOffersLoading] = useState(false);
  const [offersError, setOffersError] = useState<string | null>(null);

  const [cityFilter, setCityFilter] = useState("all");
  const [domainFilter, setDomainFilter] = useState("all");

  const [studentIdInput, setStudentIdInput] = useState("");
  const [student, setStudent] = useState<Student | null>(null);
  const [studentLoading, setStudentLoading] = useState(false);
  const [studentError, setStudentError] = useState<string | null>(null);

  const [recommendedOffers, setRecommendedOffers] = useState<Offer[]>([]);
  const [recommendedLoading, setRecommendedLoading] = useState(false);
  const [recommendedError, setRecommendedError] = useState<string | null>(null);
  const [sortCategory, setSortCategory] = useState<SortCategory>("none");

  const [applyingByOfferId, setApplyingByOfferId] = useState<Record<string, boolean>>({});
  const [applicationFeedbackByOfferId, setApplicationFeedbackByOfferId] = useState<Record<string, ApplicationFeedback>>({});

  const studentId = student?.id ?? null;

  useEffect(() => {
    const loadOffers = async () => {
      setOffersLoading(true);
      setOffersError(null);

      try {
        const data = await fetchJson<Offer[]>("/offers");
        setOffers(Array.isArray(data) ? data : []);
      } catch (error) {
        setOffersError(toErrorMessage(error));
      } finally {
        setOffersLoading(false);
      }
    };

    void loadOffers();
  }, []);

  useEffect(() => {
    if (!studentId) {
      setRecommendedOffers([]);
      setRecommendedError(null);
      return;
    }

    const loadRecommendedOffers = async () => {
      setRecommendedLoading(true);
      setRecommendedError(null);

      try {
        const params = new URLSearchParams();
        params.set("limit", "10");

        if (sortCategory !== "none") {
          params.set("sort_by", sortToApi[sortCategory]);
        }

        const data = await fetchJson<RecommendedOffersResponse>(
          `/students/${studentId}/recommended-offers?${params.toString()}`
        );

        setRecommendedOffers(data.offers ?? []);
      } catch (error) {
        setRecommendedError(toErrorMessage(error));
      } finally {
        setRecommendedLoading(false);
      }
    };

    void loadRecommendedOffers();
  }, [sortCategory, studentId]);

  const filteredOffers = useMemo(() => {
    return offers.filter((offer) => {
      const cityMatches = cityFilter === "all" || (offer.city ?? "") === cityFilter;
      const domainMatches = domainFilter === "all" || (offer.domain ?? "") === domainFilter;
      return cityMatches && domainMatches;
    });
  }, [cityFilter, domainFilter, offers]);

  const cityOptions = useMemo(() => {
    return Array.from(new Set(offers.map((offer) => offer.city).filter(Boolean))).sort();
  }, [offers]);

  const domainOptions = useMemo(() => {
    return Array.from(new Set(offers.map((offer) => offer.domain).filter(Boolean))).sort();
  }, [offers]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsedId = Number(studentIdInput.trim());
    if (Number.isNaN(parsedId) || parsedId <= 0) {
      setStudentError("Please enter a valid student ID.");
      return;
    }

    setStudentLoading(true);
    setStudentError(null);

    try {
      const profile = await fetchJson<Student>(`/student/${parsedId}`);
      setStudent(profile);
      setView("dashboard");
    } catch (error) {
      setStudent(null);
      setStudentError(toErrorMessage(error));
    } finally {
      setStudentLoading(false);
    }
  };

  const handleLogout = () => {
    setStudent(null);
    setStudentIdInput("");
    setSortCategory("none");
    setApplicationFeedbackByOfferId({});
    setApplyingByOfferId({});
  };

  const handleApply = async (offer: Offer) => {
    if (!student) {
      setStudentError("Login required before applying.");
      setView("dashboard");
      return;
    }

    const offerId = getOfferId(offer);
    if (!offerId) {
      return;
    }

    setApplyingByOfferId((previous) => ({
      ...previous,
      [offerId]: true
    }));

    try {
      const result = await fetchJson<InternshipResponse>("/internship", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          studentId: student.id,
          offerId
        })
      });

      setApplicationFeedbackByOfferId((previous) => ({
        ...previous,
        [offerId]: {
          status: result.status,
          message: result.message
        }
      }));
    } catch (error) {
      setApplicationFeedbackByOfferId((previous) => ({
        ...previous,
        [offerId]: {
          status: "error",
          message: toErrorMessage(error)
        }
      }));
    } finally {
      setApplyingByOfferId((previous) => ({
        ...previous,
        [offerId]: false
      }));
    }
  };

  return (
    <div className="page">
      <header className="hero">
        <h1>Polymove</h1>
        <p className="subtitle">Internship Offers Explorer + Student Recommendation Dashboard</p>
      </header>

      <section className="session-bar">
        <form className="login-form" onSubmit={handleLogin}>
          <label htmlFor="studentId">Student ID</label>
          <input
            id="studentId"
            type="number"
            min={1}
            value={studentIdInput}
            onChange={(event) => setStudentIdInput(event.target.value)}
            placeholder="e.g. 1"
          />
          <button type="submit" disabled={studentLoading}>
            {studentLoading ? "Loading..." : "Login"}
          </button>

          {student ? (
            <button type="button" className="ghost-button" onClick={handleLogout}>
              Logout
            </button>
          ) : null}
        </form>

        <p className="session-state">
          {student
            ? `Logged in as ${student.firstname} ${student.name} (#${student.id})`
            : "Not logged in. Login to unlock internship applications."}
        </p>

        {studentError ? <p className="message error">{studentError}</p> : null}
      </section>

      <nav className="tabs" aria-label="Feature navigation">
        <button
          type="button"
          className={view === "offers" ? "tab active" : "tab"}
          onClick={() => setView("offers")}
        >
          Offers Explorer
        </button>
        <button
          type="button"
          className={view === "dashboard" ? "tab active" : "tab"}
          onClick={() => setView("dashboard")}
        >
          Student Dashboard
        </button>
      </nav>

      {view === "offers" ? (
        <section className="panel">
          <div className="panel-header">
            <h2>Available Internship Offers</h2>
            <p>Filter by city or domain, inspect city intelligence, then apply in one click.</p>
          </div>

          <div className="filters">
            <label>
              City
              <select value={cityFilter} onChange={(event) => setCityFilter(event.target.value)}>
                <option value="all">All cities</option>
                {cityOptions.map((cityOption) => (
                  <option key={cityOption} value={cityOption}>
                    {cityOption}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Domain
              <select value={domainFilter} onChange={(event) => setDomainFilter(event.target.value)}>
                <option value="all">All domains</option>
                {domainOptions.map((domainOption) => (
                  <option key={domainOption} value={domainOption}>
                    {domainOption}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <p className="meta">{filteredOffers.length} offer(s) displayed</p>

          {offersLoading ? <p className="message info">Loading offers...</p> : null}
          {offersError ? <p className="message error">{offersError}</p> : null}

          <OfferGrid
            offers={filteredOffers}
            student={student}
            applyingByOfferId={applyingByOfferId}
            applicationFeedbackByOfferId={applicationFeedbackByOfferId}
            onApply={handleApply}
          />
        </section>
      ) : (
        <section className="panel">
          <div className="panel-header">
            <h2>Student Dashboard</h2>
            <p>Profile + recommended offers sorted by city score categories.</p>
          </div>

          {student ? (
            <>
              <article className="profile-card">
                <h3>Student Profile</h3>
                <p>
                  <strong>ID:</strong> {student.id}
                </p>
                <p>
                  <strong>Name:</strong> {student.firstname} {student.name}
                </p>
                <p>
                  <strong>Domain:</strong> {student.domain}
                </p>
              </article>

              <div className="filters">
                <label>
                  Sort recommendations by
                  <select
                    value={sortCategory}
                    onChange={(event) => setSortCategory(event.target.value as SortCategory)}
                  >
                    <option value="none">Default relevance</option>
                    <option value="safety">Safety</option>
                    <option value="economy">Economy</option>
                    <option value="quality_of_life">Quality of life</option>
                    <option value="culture">Culture</option>
                  </select>
                </label>
              </div>

              {recommendedLoading ? <p className="message info">Loading recommendations...</p> : null}
              {recommendedError ? <p className="message error">{recommendedError}</p> : null}

              <OfferGrid
                offers={recommendedOffers}
                student={student}
                applyingByOfferId={applyingByOfferId}
                applicationFeedbackByOfferId={applicationFeedbackByOfferId}
                onApply={handleApply}
              />
            </>
          ) : (
            <p className="message info">Enter a Student ID to load the personalized dashboard.</p>
          )}
        </section>
      )}
    </div>
  );
}

type OfferGridProps = {
  offers: Offer[];
  student: Student | null;
  applyingByOfferId: Record<string, boolean>;
  applicationFeedbackByOfferId: Record<string, ApplicationFeedback>;
  onApply: (offer: Offer) => void;
};

function OfferGrid({
  offers,
  student,
  applyingByOfferId,
  applicationFeedbackByOfferId,
  onApply
}: OfferGridProps) {
  if (!offers.length) {
    return <p className="message info">No offers found for this selection.</p>;
  }

  return (
    <div className="offer-grid">
      {offers.map((offer, index) => {
        const offerId = getOfferId(offer);
        const cardKey = offerId ?? `offer-${index}`;
        const feedback = offerId ? applicationFeedbackByOfferId[offerId] : undefined;
        const isApplying = offerId ? applyingByOfferId[offerId] : false;
        const isApplyDisabled = !student || !offerId || Boolean(isApplying);

        return (
          <article key={cardKey} className="offer-card">
            <h3>{offer.title ?? "Untitled offer"}</h3>

            <p>
              <strong>Company:</strong> {getCompanyName(offer)}
            </p>
            <p>
              <strong>City:</strong> {offer.city ?? "Unknown"}
            </p>
            <p>
              <strong>Domain:</strong> {offer.domain ?? "Unknown"}
            </p>
            <p>
              <strong>Salary:</strong> {formatSalary(offer.salary)}
            </p>
            <p>
              <strong>Dates:</strong> {formatDate(offer.startDate)} to {formatDate(offer.endDate)}
            </p>

            <section className="scores-block">
              <h4>City Scores</h4>
              {offer.cityScore ? (
                <>
                  <ScoreBar label="Safety" value={offer.cityScore.safety} />
                  <ScoreBar label="Economy" value={offer.cityScore.economy} />
                  <ScoreBar label="Quality of life" value={getQualityOfLifeScore(offer.cityScore)} />
                  <ScoreBar label="Culture" value={offer.cityScore.culture} />
                </>
              ) : (
                <p className="muted">No city score available for this city.</p>
              )}
            </section>

            <section className="news-block">
              <h4>Latest News</h4>
              {offer.news?.length ? (
                <ul className="news-list">
                  {offer.news.slice(0, 3).map((newsItem, newsIndex) => {
                    const newsKey = newsItem.id ?? `${newsItem.title}-${newsIndex}`;

                    return (
                      <li key={newsKey}>
                        <p className="news-title">{newsItem.title ?? "Untitled news"}</p>
                        {newsItem.content ? <p className="news-content">{newsItem.content}</p> : null}
                        <p className="news-date">{formatTimestamp(newsItem.createdAt)}</p>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="muted">No recent news available for this city.</p>
              )}
            </section>

            <button type="button" className="apply-button" disabled={isApplyDisabled} onClick={() => onApply(offer)}>
              {isApplying
                ? "Applying..."
                : student
                  ? "Apply"
                  : "Login required to apply"}
            </button>

            {feedback ? (
              <p className={feedback.status === "approved" ? "message success" : "message warning"}>
                {feedback.status.toUpperCase()}: {feedback.message}
              </p>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const percent = normalizeScore(value);

  return (
    <div className="score-row">
      <div className="score-head">
        <small>{label}</small>
        <small>{Math.round(value)}</small>
      </div>
      <div className="score-bar" role="progressbar" aria-valuemin={0} aria-valuemax={2000} aria-valuenow={value}>
        <div className="score-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(buildApiUrl(path), init);

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const apiMessage = readApiError(payload);
    throw new Error(apiMessage ?? response.statusText ?? "Request failed");
  }

  return payload as T;
}

function buildApiUrl(path: string): string {
  if (!API_BASE_URL) {
    return path;
  }

  return `${API_BASE_URL}${path}`;
}

function readApiError(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const withError = payload as { error?: unknown };
  return typeof withError.error === "string" ? withError.error : null;
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Unexpected error";
}

function getOfferId(offer: Offer): string | null {
  const rawId = offer._id ?? offer.id;
  if (rawId === undefined || rawId === null) {
    return null;
  }
  return String(rawId);
}

function getQualityOfLifeScore(score: CityScore): number {
  return score.qualityOfLife ?? score.quality_of_life ?? 0;
}

function normalizeScore(value: number): number {
  const clamped = Math.max(0, Math.min(value, 2000));
  return (clamped / 2000) * 100;
}

function formatSalary(value: number | undefined): string {
  if (value === undefined || Number.isNaN(value)) {
    return "N/A";
  }
  return `${value} EUR`;
}

function formatDate(rawDate: string | undefined): string {
  if (!rawDate) {
    return "N/A";
  }

  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) {
    return rawDate;
  }

  return parsed.toLocaleDateString("fr-FR");
}

function formatTimestamp(timestamp: number | undefined): string {
  if (!timestamp) {
    return "Date unavailable";
  }

  const parsed = new Date(timestamp);
  if (Number.isNaN(parsed.getTime())) {
    return "Date unavailable";
  }

  return parsed.toLocaleString("fr-FR");
}

function getCompanyName(offer: Offer): string {
  if (offer.company && offer.company.trim()) {
    return offer.company;
  }

  if (offer.link) {
    try {
      const host = new URL(offer.link).hostname.replace(/^www\./, "");
      const firstToken = host.split(".")[0]?.replace(/[-_]/g, " ");
      if (firstToken) {
        return capitalize(firstToken);
      }
    } catch {
      return "Not specified";
    }
  }

  return "Not specified";
}

function capitalize(value: string): string {
  return value
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}