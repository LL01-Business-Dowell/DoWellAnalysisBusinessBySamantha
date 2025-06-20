import { useRecoilValue } from 'recoil';
import AnalysingPage from '../components/AnalysingPage';
import EmailPage from '../components/EmailPage';
import MapLinkPage from '../components/MapLinkPage';
import { analysisPageEligibleAtom, emailPageEligibleAtom, mapPageEligibleAtom } from '../recoil/atom';
import { Toaster } from 'react-hot-toast';
import GoogleEmailPage from '../components/GoogleEmailPage';
import GoogleAnalysingPage from '../components/GoogleAnalysingPage';

function GooglePage() {

  const mapPageEligible = useRecoilValue(mapPageEligibleAtom);
  const emailPageEligible = useRecoilValue(emailPageEligibleAtom);
  const analysisPageEligible = useRecoilValue(analysisPageEligibleAtom);
  return (
    <>
        <Toaster reverseOrder={false} />
        <div className='flex w-screen h-screen items-center justify-center'>
        <div className='flex flex-col items-center justify-center max-w-[430px] p-3'>
            {emailPageEligible && <GoogleEmailPage/> }
            {mapPageEligible && <MapLinkPage/> }
            {analysisPageEligible && <GoogleAnalysingPage/>}
        </div>
        </div>
    </>
  );
};


export default GooglePage
