import { useNavigate } from 'react-router-dom';
import PublicHero from '../components/PublicHero';
import PublicFilters from '../components/PublicFilters';
import FeaturedVenues from '../components/FeaturedVenues';
import { usePublicVenues } from '../hooks/usePublicVenues';

const PublicLandingPage = () => {
  const navigate = useNavigate();
  const { filters, setFilters, venues, loading, refetch } = usePublicVenues({}, 6);

  return (
    <div className="space-y-8">
      <PublicHero onExplore={() => navigate('/public/sedes')} />

      <PublicFilters
        values={filters}
        onChange={setFilters}
        onSubmit={() => {
          refetch();
        }}
      />

      <FeaturedVenues
        venues={venues}
        loading={loading}
        onSelect={(sede) => navigate(`/venues/${sede.idSede}`)}
      />
    </div>
  );
};

export default PublicLandingPage;
