import { useRecoilValue } from 'recoil';
import EmailPage from '../components/EmailPage';
import { analysisPageEligibleAtom, emailPageEligibleAtom, mapPageEligibleAtom } from '../recoil/atom';
import { Toaster } from 'react-hot-toast';
import LinkedInLink from '../components/LinkedInLink';
import LinkedInAnalysing from '../components/LinkedInAnalysing';

function LinkedInPage() {

  const mapPageEligible = useRecoilValue(mapPageEligibleAtom);
  const emailPageEligible = useRecoilValue(emailPageEligibleAtom);
  const analysisPageEligible = useRecoilValue(analysisPageEligibleAtom);
  return (
    
    <>
        <Toaster reverseOrder={false} />
        <div className='flex w-screen h-screen items-center justify-center'>
        <div className='flex flex-col items-center justify-center max-w-[430px] p-3'>
            {emailPageEligible && <EmailPage/> }
            {mapPageEligible && <LinkedInLink/> }
            {analysisPageEligible && <LinkedInAnalysing/>}
        </div>
        </div>
    </>
  );
};


export default LinkedInPage
