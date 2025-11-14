import React from 'react'
import { assets } from '../assets/assets'
import { Link } from 'react-router-dom'

const MainBanner = () => {
  return (
    <div className='relative mt-8 md:mt-16 rounded-3xl overflow-hidden h-[340px] md:h-[420px]'>
      <img
        src="/images/banner_h.jpg"
        alt="Main Banner"
        className="w-full h-full object-cover"
        style={{ objectPosition: 'center' }}
      />
    </div>
  )
}

export default MainBanner
