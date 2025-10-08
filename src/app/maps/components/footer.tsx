import './footer.css';
import Image from 'next/image';
import earth from '../../images/earth.png';
import travel_animator from '../../images/travel_animator.png'
import sub_text from '../../images/sub_heading_text.svg';

export default function Footer() {
    return (
        <>
            <div className="footer">
                <Image src={sub_text} alt='sub_text' width={500} height={200} className='sub_heading' />
                <Image src={travel_animator} alt='travel_animator' width={500} height={200} className='travel_animator' />
                <Image src={earth} alt='earth' width={500} height={200} className='earth' />
            </div>
        </>
    );
}