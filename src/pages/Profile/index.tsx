import ProfileHeader from './ProfileHeader';
import InsuranceInfo from './InsuranceInfo';
import DependentsList from './DependentsList';
import Footer from '../../components/Layout/Footer';

export default function Profile() {
  return (
    <div className="min-h-screen bg-gray-50">
      <ProfileHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <InsuranceInfo />
          <DependentsList />
        </div>
      </div>
      <Footer />
    </div>
  );
}