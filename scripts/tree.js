/**
 * This places a christmas tree randomly in the website
 */
(function() {
    const treeUrl = '/assets/hellochristmas.svg';
    const size = Math.random() * 0.5 + 0.5; // random size between 0.5 and 1
    const treeWidth = 100 * size;
    const treeHeight = 100 * size;

    const tree = document.createElement('img');
    tree.src = treeUrl;
    tree.width = treeWidth;
    tree.height = treeHeight;

    tree.style.position = 'fixed';
    tree.style.left = Math.random() * (window.innerWidth - treeWidth) + 'px';
    tree.style.top = Math.random() * (window.innerHeight - treeHeight) + 'px';
    tree.style.zIndex = 1000;

    document.addEventListener('scroll', () => {
        // change opactiyu based on scroll position
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const opacity = 1 - (scrollTop / maxScroll);
        tree.style.opacity = opacity;
    });

    document.body.appendChild(tree);
})();