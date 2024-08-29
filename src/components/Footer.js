import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faTwitter, faInstagram, faGithub } from '@fortawesome/free-brands-svg-icons';

const Footer = () => {
  return (
    <footer className="bg-cyan-800 text-white py-4 fixed bottom-0 w-full">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="text-sm">
            © Nosso TCC 2024.
          </div>
          <div className="space-x-4">
            <a href=" " className="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-black mr-4">Sobre</a>
            <a href=" " className="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-black mr-4">Contato</a>
            <a href=" " className="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-black mr-4">Privacidade</a>
            <a href=" " className="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-black mr-4">
              <FontAwesomeIcon icon={faFacebook} />
            </a>
            <a href=" " className="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-black mr-4">
              <FontAwesomeIcon icon={faTwitter} />
            </a>
            <a href=" " className="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-black mr-4">
              <FontAwesomeIcon icon={faInstagram} />
            </a>
            <a href=" " className="block mt-4 lg:inline-block lg:mt-0 text-white hover:text-black mr-4">
              <FontAwesomeIcon icon={faGithub} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
