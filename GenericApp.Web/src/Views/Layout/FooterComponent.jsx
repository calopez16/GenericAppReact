import React from 'react';

const FooterComponent = () => {
    return (
        <footer className="footer bg-dark text-light text-center p-3 mt-auto">
            <p className="m-0">&copy; {new Date().getFullYear()} Mi Sistema. Todos los derechos reservados.</p>
        </footer>
    );
};

export default FooterComponent;