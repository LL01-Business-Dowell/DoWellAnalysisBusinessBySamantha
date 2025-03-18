import { useRecoilValue } from 'recoil';
import AnalysingPage from '../components/AnalysingPage';
import EmailPage from '../components/EmailPage';
import { analysisPageEligibleAtom, emailPageEligibleAtom, mapPageEligibleAtom } from '../recoil/atom';
import { Toaster } from 'react-hot-toast';
import ReviewLink from '../components/ReviewLink';
import ReviewAnalysing from '../components/ReviewAnalysing';

function ReviewPage() {

  const mapPageEligible = useRecoilValue(mapPageEligibleAtom);
  const emailPageEligible = useRecoilValue(emailPageEligibleAtom);
  const analysisPageEligible = useRecoilValue(analysisPageEligibleAtom);
  return (
    <>
        <Toaster reverseOrder={false} />
        <div className='flex w-screen h-screen items-center justify-center'>
        <div className='flex flex-col items-center justify-center max-w-[430px] p-3'>
            {emailPageEligible && <EmailPage/> }
            {mapPageEligible && <ReviewLink/> }
            {analysisPageEligible && <ReviewAnalysing/>}
        </div>
        </div>
    </>
  );
};


export default ReviewPage
