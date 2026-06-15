import React from 'react';
import { Link } from 'react-router-dom';
import './ArtistPage.css';

// Renders an artist landing page (song groups + links) from a catalog entry.
const ArtistPage = ({ artist }) => {
  const backgroundStyle = artist.background.image
    ? { backgroundImage: `url(${artist.background.image})` }
    : { backgroundColor: artist.background.color };

  return (
    <div className="artist-page-background-container">
      <div className="artist-page-background-style" style={backgroundStyle}></div>
      <div className="artist-page-content">
        <div className="artist-page-content-style">
          {artist.groups.map((group, groupIndex) => (
            <div className="artist-page-dark-block" key={groupIndex}>
              <div className="artist-page-song-group-header">
                <div className="artist-page-text">{group.header}</div>
              </div>
              <div className="artist-page-song-group-container">
                {group.songs.map((song, songIndex) => (
                  <Link
                    key={songIndex}
                    to={`/${artist.key}/${song.slug}`}
                    className="artist-page-button-style"
                  >
                    {song.title}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArtistPage;
