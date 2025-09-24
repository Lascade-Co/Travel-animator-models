import Image from 'next/image';
import './heading.css';
import headerImage from '../images/header/header.svg';
import headerImage2 from '../images/header/header2.svg';
import hotAirBalloon from '../images/header/hot_air_balloon.png';
import boat from '../images/header/Ship.png';
import car from '../images/header/car.png';
import tanker from '../images/header/tanker.png';
import cycle from '../images/header/Cycle.png';
import bulletTrain from '../images/header/bullet_Train.png';
import flight from '../images/header/Flight.png';

export default function Heading () {
    return (
        <>
            <div className="heading">
                <Image src = {headerImage} alt='header' width={0} height={0} className='heading_text_1'/>
                <Image src={headerImage2} alt='header2' width={0} height={0} className='heading_text_2' />
                <Image src={hotAirBalloon} alt='hot_air_balloon' width={0} height={0} className='hot_air_balloon' />
                <Image src={boat} alt='boat' width={0} height={0} className='header_boat' />
                <Image src={car} alt='car' width={0} height={0} className='car' />
                <Image src={tanker} alt='tanker' width={0} height={0} className='tanker' />
                <Image src={cycle} alt='cycle' width={0} height={0} className='cycle' />
                <Image src={bulletTrain} alt='bulletTrain' width={0} height={0} className='bullet_train' />
                <Image src={flight} alt='flight' width={0} height={0} className='flight' />
            </div>
        </>
    )
}