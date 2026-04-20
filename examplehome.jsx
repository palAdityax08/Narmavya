import React, { useEffect, useState, useRef } from 'react';
import Nav from './nav';
import axios from 'axios';
import load from '/load.gif';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Category from './Others/Category';
import Cart from './Others/carts';
import Blogcart from './Others/blogcart';
import Header from './Others/Footer';
import narmavyav from '../assets/nirr_video.mp4.mp4';
import pic1 from '../assets/picc.jpg';

// Local data for Madhya Pradesh products
const mpProducts = [
  {
    id: 1,
    title: "Chanderi Silk Saree",
    price: 3500,
    thumbnail: "https://placehold.co/400x300/a83232/ffffff?text=Chanderi+Saree"
  },
  {
    id: 2,
    title: "Maheshwari Handloom",
    price: 2800,
    thumbnail: "https://placehold.co/400x300/e8c33a/000000?text=Maheshwari+Handloom"
  },
  {
    id: 3,
    title: "Bastar Tribal Art",
    price: 1500,
    thumbnail: "https://placehold.co/400x300/8d8869/000000?text=Bastar+Art"
  },
  {
    id: 4,
    title: "Gond Painting",
    price: 1200,
    thumbnail: "https://placehold.co/400x300/698d8d/ffffff?text=Gond+Art"
  },
];

const Home = () => {
  const [finalpro, setfinalpro] = useState([]);
  const [finalpro2, setfinalpro2] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const contentRef = useRef(null);

  const getProducts = async () => {
    try {
      const res = await axios.get('https://dummyjson.com/products/category/womens-dresses');
      setfinalpro(res.data.products.slice(0, 4));
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const getProducts2 = async () => {
    try {
      const res = await axios.get('https://dummyjson.com/products/category/fragrances');
      setfinalpro2(res.data.products.slice(0, 4));
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    getProducts();
    getProducts2();
  }, []);

  const setCheck = (e) => {
    let category = e.target.name;
    navigate(`/products/${category}`);
  };

  const handleScrollToContent = () => {
    contentRef.current.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className='bg-white w-full flex justify-center items-center h-[100vh]'>
        <img src={load} alt="Loading" className='w-[300px] h-[300px] object-cover' />
      </div>
    );
  }

  // Carts component mapping
  let Carts = finalpro.slice(0, 4).map((val, i) => (
    <Cart key={i} url={val.thumbnail} title={val.title} price={val.price} />
  ));

  let Carts2 = finalpro2.slice(0, 4).map((val, i) => (
    <Cart key={i} url={val.thumbnail} title={val.title} price={val.price} />
  ));


  return (
        <div className='relative w-full'>
        
            {/* NavBar  */}
            <Nav />
      <ToastContainer />
       
      {/* Hero Section with Video Background */}
      <div className='w-full min-h-screen relative'>
        <video
          autoPlay
          loop
          muted
          className='absolute inset-0 w-full h-full object-cover z-0'
        >
          <source src={narmavyav} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className='absolute inset-0 bg-black bg-opacity-40 z-10 flex flex-col justify-center items-center text-center p-4'>
          <h4 className='text-sm text-white font-medium tracking-wide mb-2'>WELCOME</h4>
          <h1 className='text-5xl md:text-7xl font-serif text-white leading-tight mb-4'>
            The Heart & Craft of Madhya Pradesh
          </h1>
          <p className='text-lg md:text-xl text-white max-w-2xl font-light mb-8'>
            Born of a dream to revive our region's artisanal traditions, Narmavya offers
            handcrafted luxury from the heart of India.
          </p>
          <button 
            onClick={handleScrollToContent} 
            className='absolute bottom-8 left-1/2 -translate-x-1/2 bg-transparent text-white px-6 py-3 rounded-full font-medium text-lg hover:bg-white hover:text-black transition-colors duration-300'>
            DISCOVER
          </button>
        </div>
      </div>
     
      {/* Main content below the video hero */}
      <div ref={contentRef}>

        
         {/* categories */}
        <div className='min-h-100 font-extrabold bg-gray-300 text-black-500  w-full bg-[#f9f6ef] p-10 flex flex-wrap gap-12 relative top-[0]'>
            <Category url={"https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQeT2qApOXMl7mtGvKvOYP9jvzl7al8S3jcpzWG1AEiB55dBhX6iFpRoAs4iZ68ofitLzA-d6Qr9djNsLhFSoFZd2bNH-xiyL3kq-Fd6pfLSqdmg2XqRtzx"} title={"smartphones"} quntity={10} />
            <Category url={"https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcR0kQIw8yfUjYQR7deBLaW3ETdGn2kG0I-CLoywoDE5QbTz2Uh93poKLQcIZD78EOy81ah-YVQ84WnQJ_9Qqh63Ol3HvjgM62gEcaIkKj9C"} title={"Laptops"} quntity={25} />
            <Category url={'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTRzMsBz7oduiIivg1mzFhDSJAXTLs6AN5_Cw&s'} title={"groceries"} quntity={12} />
            <Category url={'https://static.vecteezy.com/system/resources/thumbnails/034/630/930/small_2x/elegant-decorative-vases-and-planters-with-succulents-and-other-plants-on-transparent-background-interior-accessories-cut-out-home-decor-front-view-ai-generated-png.png'} title={"home-decoration"} quntity={17} />
            <Category url={'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_XnEUESVy9GVibsx-GFe6p1wzV4ndKRxjPQ&s'} title={"womens-jewellery"} quntity={8} />
            <Category url={'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMTEhUUExIVFRUXFRcYFRgYFxcXFRgVGhcWGBcWFxUYHSggGBolGxMVITEhJSkrLi4uGB8zODMsNygtLisBCgoKDg0OGhAQFy0lHyYxLi0rKy0tLS0tLS0vLSstLS0tLS0uLy0tLS0rKy0tLS0tLS0tLS0tLS0tKy0tLS0tLf/AABEIAOEA4QMBIgACEQEDEQH/xAAcAAEAAgMBAQEAAAAAAAAAAAAABAUDBgcCAQj/xABIEAACAQICBQkEBgYIBwEAAAAAAQIDEQQhBRIxQWEGEyJRcYGRofAHMrHBFEJSYoLRI5KisuHxFTNDcnODk8IkNFNjs9LTFv/EABgBAQEBAQEAAAAAAAAAAAAAAAACAQME/8QAIhEBAQEBAAICAgMBAQAAAAAAAAERAgMhEjETQSIyUfAE/9oADAMBAAIRAxEAPwDuIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHipVjH3ml2gewQamlaa3t9n8TBLTUd0fMzYYtQU70191eIjpngh8o3FwCsjpdb15kmlpCEt9u0bGJQPiZ9NAAAAAAAAAAAAAAAAAAAAAAAPk5JK7dktoH0jYrHQp7Xn1Lb/ApNLcobXjTeXXvfZ1GtvSWs3mRe1Tls2K03J+70VwzZV1cW283+ZVyxDfE8qsRbqsWDrcT46nr0yC6x6VQzTEvnWOdfq5E531keXW9ZAxOVZmWGIfWVMq/r0zysT6yGmNnwOk5RfDq3GxYTFRqK6711GgYaq27Lb3FtgMU6ck79q60Xz0yxuAMWHrxmrxf8H1MynRAAAAAAAAAAAAAAAAAAAPkpJK7yS2mm8oNNObcYu0Fs+9xZM5S6W204vJe8+t9XYjRdIYhnLvr9L55YtIY9oq6OOtUj4GPFyv6ZWVZ2afFHN0bxCpdXDqesyrwWK6O091MSaxPdc9RrlWsR6yParAWXPniVf1mQVVPMp+swJsq/ExSr5kWMjHWlYDbdEx/ROe9u2/YurvbPLqu5n0VnhY9r+RAqvPvNrGw6A0hq1oQbyqqUf8yCco+MFP9RG2nMPpGpzU19TE0X3Oapy/ZqSOnnTio6gAC0gAAAAAAAB8lJLayi0vprVbjB7Nr48CjeNbebuTeo3G8KaexrxPRo0cUzPS0lJbJPxM+Tfi3IqtNaS1IuMX0ntfV/ErP6bna2t8n4lfi8QmtgvRIqNIVzX8RUvtLHSNXNoqapydIiV1tKvFRLaqQcTSv6+QHvC4q0TxV0musrqdGrUk4U4OVnZvZGPbJ5FthOSu+rUbfVHKPi834I3DUaOkETKWNT3+ZNp8mKS+r5v5kiPJun9nz/iYIlPEcTPB3M3/AOfjuv4mSloR36LlfhmDWKMDBikXVPQ2IWyClwbUH43+R9xPJ+tJXVN36rx+KeaGU2LzQa/4OPbL5FfiY5lxovCyhhoQkmpZtrert5GGtgn1FWJ1rulpWoTd9k6L7+fpW8zrqOQcpI/otXfOth4JcedhL/adfRXH3Tv6n/f4AA6OYAAAAAFXpzSXNJRj78k/wxVk5eMor+RaGkcoqt69V391QprsScn+1V8kT1ciuZqpxOJuz7Cd95V1amZIw9VHFawUwqhh1/WR91vWQGXnO0+c562+ZhcvW08OpxNEPTlPJSXY/kUutl69I2DGdKnJcPNZ/I1y5jY+TPFJXkkfZTXAwqra7AuYYjYr5bs9ncS6czX6WL4+u4mUsWuteuJgvITRmVTj8Spp4jj5llorDupLbaKzk+HUuLNFjgcI55vKK2vb3LrfwM1fSUad401qre1tfeYtK6QUIqMMlsiupL+ZqOLx9rtvJJtvqS3+uBvVnMOeb1cbHieUEaablJRS37CixHtHhGWrGnOfHKK7r3fkaLpHHyrTTd9Ve6vK74kBZzfecfn1Xpnh5n26po/2lU379OpHPblJeTv5Gz4blBRrwvCcZLg812p7Dh+Ej0e2/wAydo26k2m08tmW42eSp68POem/16n0jG0IQzhRqqrN7tdZU48Xd3OunJeSWc6S65w+KOtHfxe9rz+X1kAAdXIAAAAADnelZ3nWf/dqeTidEOa6T/ra66q1Tzsc+/0vj9qHEVMz7hpkfFvM2XQGDhGlGcoqUp9JXzSV8rLZd2v3nORVRsNRqT92Mn2J28dhOhoms9yXbL8mWM9Ipel+Zh/pVPeVkZtYoaBk/enFdzl+RJp6Bpr3pzfZaK8kI6RX2vI+rSEeteKubkZ7SaeiaC/s0+1t/M90tH0I7KNNfgj+RHWNXWvFfmevpy6zfQnRhFbIxXYkj3ZdSK5Y5GSOKN1mJrpx3xXgjFPA0ntpU3+CP5GF41IjYjT9GHvTS7xsMZa2g8NLbRh3Xj+7YrsVGnQi4Uo2je7zbbb4vuRMw+madSnKdOV0nq33Xtd+TXiazpbGWT8t2ef8WTWxVaXxl28/5fzv5Gr6crNRjC+bWtLsfuR8M/As5S16iT91XlJ9UY5vy+Jr+Jrc5UlJ/WlfsXV3JJHm8l249nh5yaj6u3hl3+mMNh9r9esz3J/Em0o5dv8AL8iPp2+6jRVrL1sJmBjn6+yYKsc2zLgZ2v2fl+RUnpFvt0DkEtbEUl1Nt/hjJ/Gx1k5j7JsO5VKlR7IQS/FJ3+EX4nTj1+KZy8Xlu9AAOjkAAAAABznTtK2MxEXsepNd8VfzR0Y0nl3h9StRr2yknRn1Xu5Qv2tyVyO/pfH20XHQzZtOArXw9Fr/AKaXfHovzRSY6je575NYtas6D2xevDqafvJPrTz731HOKqXjJsr5VnxJ+KiV1SAB4l9Y+my+0R5JmOT9ZASXjH1+ZjWOkRpyfqxhbDU7+kHwPL0jL0yu12eXVauBIxOPds/NlHjMe9kUrvYks77lxPWMruxK5FaMdbEc7Jfo6LvwlV+pH8Pvd0esMb1h6XMYanSfvRjefGbzl5trsSNX0ti7t8PT+Re6bxTS25mnVr1JqEdsnbsW9/EW/tsm+njE1dSg39as2l/hx2vvdvApI1PPLxJmn8WpVNWHuQShD+6t/e8+8r4LPPdmcZN916tz1GRyzROw887d79d5XU7t3JlCyfkh1DnpIxGztfr4nyhG1zLVhml1eviX/I/QTxWJhTt0I9Oq/uJ7L9bdl49RvM/TOr+3T/Z1ozmcHBtWlV/SPseUP2Un3m0HyMUlZZJbD6euTJjw27dAAawAAAAACDpvRkcTQnRlkpLJ/Zks4y7mkycAOP3mpSpVlarTdpr4SvvjLJ348URsXR6rprY1k0+B0XlbyYWJSq0pKGIguhLdJfYnw47rnOp1GpulWg6VaO2DyT4xk9z3LwZxsx1ntGnpivDKUY1F131JfCz8EeVp+i/fjOm/vQbX60bokTpK+a8fhYjzwsXuAzU8bQmujVg+ySPfNp7JLxRW1dFQe2KfakzBLQNPdG3Y2vgPTFpPD+svyItSk0R1otrJVKi/zJf7j5LRU3/bVvGP/qPTfZUi16RExFVJbfgTKegU/eqVZfjdvKxZ4PQ1CDT5qMnuc7yf7QGs4HR1TFz1aSah9aq1+jiuEtkpfdXkb5SjSw1GNKGUYra9rb2yfXJs8YjSKjG2WzJLLyNa0lpK97vZx2defzGj7pfSes27/wAioniuapyl/aVFaPXGnvfbL4XI9XEL35+79WOxze5vqj8StxddzldvN+vAjr36deJntic7u/cZoI8QikZaauKqMsMlfL5kjBRu77kYOactmxeR7w+JUXZ7PWZKlthcPKpNRjFynJ2ilm23uR3Lkfyfjg6Cjk6krOrLjuiuC2eL3mreyHBYedKWIj0qyk4NO36NbtVfeTTv3dd+jHbxcZNefy97cAAdXEAAAAAAAAAAAoOWuj6NTC1ZVaak4U5OD2SjK2VpLPbbLeX5q/tIxip4Gd/rShHz1n5QZPdzmq4m9RxlaXlTqKjnO7jGKa1ldtJR61m9xc4qrKlLVrUalJ8U7ftJeVyFyA0f9J0tSbV40r1pfhXQ/bcD9AVKakrSSa3pq68Dj4+bZuu/lvM6zHDI4yD+uvxJrzZnp1U9ji+ySZ1PF8kcDU97C003vgubfjCxT4j2aYKXu87Dsnrfvpl/Hpz+XLRXPg/L8z461tz8jbZ+y6l9XEzXbCD/AHdUw1PZe3sxS/05f/QnOv8AG7z/AK1aWJ7PEg4nS6ira68TcZeye+3EQfbRv8Zmuct+SU9HUYVVVU1Keq1GnGnq5Np3zvsYssn02fG3Na9Wxknmk+2XQj4vN+BT43Gxir/1jWzK1OPG22T4s3vkv7PXj8NDEfSdXWclquDm04ya97WXVck6b9k6o4avVeK1ubpVJ25u19WLdr63AfG2a3eZcco+lSnLWbu/Ik00Y6WG1Ka69W77d52nRnsjw7hCVSvWvKMW0tRJNpNrNMnn3fS+rOZLXH4UW/WwnYPAyk1GMZSb2RSbk+5HcsD7ONH0/wCylUf35ya/VVl5GyYHR1GirUqUKa6oRUfGyzL/AB2/dR+WT6jkOgvZ1iq1nUSw9P72c32U182jD7TuQccJSp4jD60oRtGum7u7fRq8L31X+HiduMGNwkKtOdOpFShOLjJPY4tWaK/FMxH5ut1w/wBlOnVh8Wot2p10oS4Tu+bb724/iO7n5o5R6EngMVOhJuy6VKexyg30ZJ/aVvFM73yL039LwlOq/ftq1OFSOUu57VwaI8Nzeavz87nUXgAO7zgAAAAAAAAAAHOfbRi9WhRh1zlL9VKK/wDIzoxxz234v9LCCfu01f8AE5N/uo5+W/xdfDP5rD2GaN6GIxLWc5qnF/dhnK3fJfqnUzXuQGi/o2j8NTatLm1Of9+fTkn2OVu42EriZMR3d6tAAUkAAA1P2oYFVdHVfuOM/B2b8GzbDzVpqScZJOLTTTzTT2prejOpsxvNy60T2L1L6PcfsV6kf3X8zZOWX/IYrjQqLxg0TtG6No4eHN0KcacLt6sVZXe12W8gctH/AMDiP8Jrxy+ZmZzird61+fZUNfEU6X26lOn3TmoryZ+m0j88ciqHPaUw63c9r/6cXUXnFH6IOfhnq11/9F9yAAOzzgAA032ncl/pmG16cb16N5U7bZR+tT77Jril1mjexzT3N4h4eT6FddFdVWKy8Y3XdE7WcN9p2gZYHGQxVHo06s9eLWyFddJpdtnJL+91HHyTL847+Lr5S8V3IFbyb0tHFYalXjbpxzS3TWU490k0WR2l1xsz0AAMAAAAAAAADiPLGn9M0zDD7pV4Ql/cppOp5Ql4nbisp8n8NHEPFKjFV2mnNXu00k8r2zSWdtxHfPyxfHfx1ZJH0AtAAAAAAAAAa/y9lbAV7q6tFW2XvUgrX7zYDWfaRPV0dWfGjsyf9fTWT3Mnr6quf7Rzb2RYTW0lKe6nRqPvlKMV5ax285V7EsN08ZV40qa7tecv3onVSfF/Vfmv86AA6OQAABWcpNB0sZh50Kq6Mlk170ZLOM48UyzAFFyN5NxwGH5iNSVTpyk5SSTvK2SSySyRegCTG26AAMAAAAAAAAAAAAAAAAAAAAAApOWmip4nBVaNO2vLUcbuybhOM7X3X1Ld5dgyzZjZcutS9mvJ6pg8LKNZJValWVSaTTtlGEVdZPowTy6zbQBJkw6tt2gANYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/9k='} title={"furniture"} quntity={13} />

       </div>

        <div className='bg-[#f9f6ef] w-full px-6 py-6 flex flex-col md:flex-row gap-6'>
                {/* Left Banner */}
                <div className='w-full md:w-1/2 h-[80vh] rounded-lg overflow-hidden shadow hover:scale-95 transition-all'>
                    <img
                        src={pic1}
                        alt="commitment"
                        className='w-[100%] h-full object-cover'
                    />
                </div>
            </div>


        {/* categories */}
        <div className='min-h-60 font-extrabold bg-gray-300 text-pink-500  w-full bg-[#f9f6ef] p-5 flex flex-wrap gap-3 relative top-[0]'>
            <Category url={"https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcQeT2qApOXMl7mtGvKvOYP9jvzl7al8S3jcpzWG1AEiB55dBhX6iFpRoAs4iZ68ofitLzA-d6Qr9djNsLhFSoFZd2bNH-xiyL3kq-Fd6pfLSqdmg2XqRtzx"} title={"smartphones"} quntity={10} />
            <Category url={"https://encrypted-tbn0.gstatic.com/shopping?q=tbn:ANd9GcR0kQIw8yfUjYQR7deBLaW3ETdGn2kG0I-CLoywoDE5QbTz2Uh93poKLQcIZD78EOy81ah-YVQ84WnQJ_9Qqh63Ol3HvjgM62gEcaIkKj9C"} title={"Laptops"} quntity={25} />
            <Category url={'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTRzMsBz7oduiIivg1mzFhDSJAXTLs6AN5_Cw&s'} title={"groceries"} quntity={12} />
            <Category url={'https://static.vecteezy.com/system/resources/thumbnails/034/630/930/small_2x/elegant-decorative-vases-and-planters-with-succulents-and-other-plants-on-transparent-background-interior-accessories-cut-out-home-decor-front-view-ai-generated-png.png'} title={"home-decoration"} quntity={17} />
            <Category url={'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_XnEUESVy9GVibsx-GFe6p1wzV4ndKRxjPQ&s'} title={"womens-jewellery"} quntity={8} />
            <Category url={'data:image/jpeg;base64,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'} title={"furniture"} quntity={13} />

                <Category url={'data:image/jpeg;base64,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'} title={"sunglasses"} quntity={10} />
            </div>

            {/* product */}
            <div className='relative bg-white w-full min-h-[300px] max-[425px]:top-[45vh]'>
                <div className='p-5 rounded'>

                    <div className='flex justify-between items-center'>
                        <div>
                            <h1 className='text-3xl  font-extrabold text-green-600  mb-1'>Girls' Clothes</h1>
                            <p className='text-gray-800 font-extrabold mb-3'>Stylish and affordable girls’ clothing online. Shop now!  </p>
                        </div>

                        <button onClick={setCheck} name='tops' className='bg-red-500 px-3 py-2 rounded text-white font-medium active:scale-105'>Explore More</button>
                    </div>

                    <div className='flex gap-3  max-[425px]:flex-col max-[768px]:overflow-auto'>
                        <div className='w-[230px] max-[425px]:w-full h-[350px] flex-shrink-0'>
                            <img src="https://content.jdmagicbox.com/quickquotes/listicle/listicle_1720685131160_m6cqz_740x493.jpg?impolicy=queryparam&im=Resize=(847,400),aspect=fit&q=75" alt="" className='w-full hover:scale-95 h-full rounded object-cover' />
                        </div>

                        {/* <Cart url={product1} title={"Dried Mango"} price={100} />
                        <Cart url={product2} title={"Crunchy Crips"} price={450} />
                        <Cart url={product3} title={"Jewel Cranberries"} price={280} />
                        <Cart url={product4} title={"Almond Organic"} price={190} /> */}
                        {finalpro.length > 0 ? Carts : loadTime}
                    </div>
                </div>
            </div>

            <div className='relative bg-white w-full min-h-[300px]  max-[425px]:top-[20 vh]'>
                <div className='p-5 rounded'>

                    <div className='flex justify-between items-center'>
                        <div>
                            <h1 className='text-3xl font-extrabold text-blue-900 max-[425px]:text-2xl mb-1'>Fragrances</h1>
                            <p className='text-gray-800 font-extrabold mb-3'>Discover long-lasting perfumes and body sprays that match your vibe. Shop top fragrances online at unbeatable prices.</p>
                        </div>

                        <button onClick={setCheck} name='fragrances' className='bg-pink-500 px-3 py-2 rounded text-white font-medium active:scale-105'>Explore More</button>
                    </div>

                    <div className='flex gap-3 max-[425px]:flex-col max-[768px]:overflow-auto'>
                        <div className='w-[230px] hover:scale-95 max-[425px]:w-full h-[350px]'>
                            <img src='https://cdn.riah.ae/storage/upload/images/2024/12/03/674eb51f1b2e1.jpg' alt="" className='w-full h-full rounded object-cover' />
                        </div>

                        {/* <Cart url={product5} title={"Fresh tamato"} price={50} />
                        <Cart url={product2} title={"Crunchy Crips"} price={450} />
                        <Cart url={product3} title={"Jewel Cranberries"} price={280} />
                        <Cart url={product4} title={"Almond Organic"} price={190} /> */}
                        {finalpro.length > 0 ? Carts2 : loadTime}
                    </div>
                </div>
            </div>

            {/* Gallery */}
            <div className='w-full px-6 py-6 flex flex-col md:flex-row gap-6'>
                {/* Left Banner */}
                <div className='w-full md:w-1/2 h-[40vh] rounded-lg overflow-hidden shadow hover:scale-95 transition-all'>
                    <img
                        src="https://assets.aboutamazon.com/85/47/87d3593c4ba88f803ee2ec833d1d/aa-mar2024-bestdealstoshopspringsaledeals-hero-2000x1125.jpg"
                        alt="Women's Fashion"
                        className='w-[90%] h-full object-cover'
                    />
                </div>
                <div className='w-full md:w-1/2 h-[40vh] rounded-lg overflow-hidden shadow hover:scale-95 transition-all'>
                    <img
                        src="https://assets.aboutamazon.com/ce/3c/8019e35f43f9b01b1a37bf45754c/aa-mar2025-bss-us-standard-hero-v2-600kb-2000x1125.jpg"
                        alt="Women's Fashion"
                        className='w-[90%] h-full object-cover'
                    />
                </div>

                {/* Right Banner */}
                <div className='w-full md:w-1/2 h-[40vh] rounded-lg overflow-hidden shadow hover:scale-95 transition-all'>
                    <img
                        src="https://assets.aboutamazon.com/dims4/default/fe14d87/2147483647/strip/true/crop/1999x1125+1+0/resize/1240x698!/quality/90/?url=https%3A%2F%2Famazon-blogs-brightspot.s3.amazonaws.com%2F85%2F28%2F4b533c1446b4ab8aef81fea4f611%2Fbigspringsale-en.png"
                        alt="Men's Shoes"
                        className='w-[90%] h-full object-cover object-center'
                    />
                </div>
            </div>

            <div className='p-5 rounded relative max-[425px]:top-[150px] max-[768px]:-top-10'>

                <div>
                    <div>
                        <h1 className='text-3xl font-extrabold  text-purple-600 mb-1'>Latest News</h1>
                        <p className='text-gray-800 font-semibold  mb-3'>Present posts in a way to highlight interesting momonts of your blog</p>
                    </div>

                    <div className='flex gap-10  max-[768px]:overflow-y-auto max-[425px]:flex-col'>
                        <Blogcart
                            date="July 30, 2025"
                            title="How to Style Sneakers with Any Outfit"
                            url="https://cdn.pixabay.com/photo/2020/05/04/07/15/nike-5128118_640.jpg"
                        />

                        <Blogcart
                            date="Aug 10, 2025"
                            title="Top 10 Wardrobe Essentials for Women"
                            url="https://media.istockphoto.com/id/821808168/photo/woman-with-her-wardrobe.jpg?s=612x612&w=0&k=20&c=rNeOSdHCVB7cTxMuWh-DHHppPhoO5QHNl58iOVFDFLo="
                        />

                        <Blogcart
                            date="Aug 11, 2025"
                            title="Why Fragrances Are the New Fashion Statement"
                            url="https://cdn.pixabay.com/photo/2017/01/19/04/38/fragrance-1991531_640.jpg"
                        />

                    </div>

                </div>


            </div>

            <br />
            <hr />
            <Header />

            <ToastContainer />
        </div>
        </div>
    )
}

export default Home

