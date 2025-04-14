
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { DepositButton } from './DepositButton';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <nav className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-2xl font-bold mr-6">
            DUMP.FUN
          </Link>
          <div className="hidden md:flex space-x-4">
            <Link to="/cases" className="hover:text-gray-300">
              Cases
            </Link>
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="hover:text-gray-300 flex items-center"
              >
                Games
                <svg
                  className="w-4 h-4 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </button>
              {dropdownOpen && (
                <div className="absolute z-10 left-0 mt-2 w-48 bg-gray-700 rounded-md shadow-lg py-1">
                  <Link
                    to="/crash"
                    className="block px-4 py-2 hover:bg-gray-600"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Crash
                  </Link>
                  <Link
                    to="/mines"
                    className="block px-4 py-2 hover:bg-gray-600"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Mines
                  </Link>
                  <Link
                    to="/blackjack"
                    className="block px-4 py-2 hover:bg-gray-600"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Blackjack
                  </Link>
                  <Link
                    to="/horseracing"
                    className="block px-4 py-2 hover:bg-gray-600"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Horse Racing
                  </Link>
                  <Link
                    to="/tower"
                    className="block px-4 py-2 hover:bg-gray-600"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Tower
                  </Link>
                </div>
              )}
            </div>
            <Link to="/case-battles" className="hover:text-gray-300">
              Case Battles
            </Link>
            <Link to="/affiliates" className="hover:text-gray-300">
              Affiliates
            </Link>
          </div>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <DepositButton />
          <Link
            to="/profile"
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
          >
            Profile
          </Link>
        </div>

        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)}>
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              ></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden mt-4">
          <Link
            to="/cases"
            className="block py-2 hover:bg-gray-700"
            onClick={() => setIsOpen(false)}
          >
            Cases
          </Link>
          <div className="block py-2 hover:bg-gray-700">
            <button
              onClick={toggleDropdown}
              className="flex items-center justify-between w-full"
            >
              <span>Games</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={dropdownOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
                ></path>
              </svg>
            </button>
            {dropdownOpen && (
              <div className="pl-4 mt-2">
                <Link
                  to="/crash"
                  className="block py-2 hover:bg-gray-600"
                  onClick={() => setIsOpen(false)}
                >
                  Crash
                </Link>
                <Link
                  to="/mines"
                  className="block py-2 hover:bg-gray-600"
                  onClick={() => setIsOpen(false)}
                >
                  Mines
                </Link>
                <Link
                  to="/blackjack"
                  className="block py-2 hover:bg-gray-600"
                  onClick={() => setIsOpen(false)}
                >
                  Blackjack
                </Link>
                <Link
                  to="/horseracing"
                  className="block py-2 hover:bg-gray-600"
                  onClick={() => setIsOpen(false)}
                >
                  Horse Racing
                </Link>
                <Link
                  to="/tower"
                  className="block py-2 hover:bg-gray-600"
                  onClick={() => setIsOpen(false)}
                >
                  Tower
                </Link>
              </div>
            )}
          </div>
          <Link
            to="/case-battles"
            className="block py-2 hover:bg-gray-700"
            onClick={() => setIsOpen(false)}
          >
            Case Battles
          </Link>
          <Link
            to="/affiliates"
            className="block py-2 hover:bg-gray-700"
            onClick={() => setIsOpen(false)}
          >
            Affiliates
          </Link>
          <div className="mt-4 flex flex-col space-y-2">
            <DepositButton />
            <Link
              to="/profile"
              className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded text-center"
              onClick={() => setIsOpen(false)}
            >
              Profile
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
