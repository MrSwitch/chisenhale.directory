/**
 * This places a christmas tree randomly in the website
 * and tracks how many the user has found in localStorage
 * until they find them all.
 * Each time the tree is clicked it animates to the bottom right
 * and increments the counter.
 * When all trees are found a message is shown with a reset button.
 * There are a total of 10 trees to find.
 */

const totalTrees = 10;
const counter = window.localStorage.getItem('christmasTreeCounter') || 0;
const completedText = `🎅 Well done! You've found all ${totalTrees} Christmas Trees! ${Array.from({ length: totalTrees }, (_, i) => `🎄`).join('')}`;

const size = Math.random() * 0.5 + 0.5; // random size between 0.5 and 1
const treeWidth = 100 * size;
const treeHeight = 100 * size;

const incrementCounter = createCounter();

if (counter < totalTrees) {
    createTree({
        width: treeWidth,
        height: treeHeight,
        onClick: incrementCounter,
    });
}

/**
 * Increment the counter and store it in localStorage
 */
function createCounter() {
    let count = parseInt(window.localStorage.getItem('christmasTreeCounter') || '0', 10);
    const counterElm = document.createElement('div');
    counterElm.style.position = 'fixed';
    counterElm.style.bottom = '10px';
    counterElm.style.right = '10px';
    counterElm.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    counterElm.style.color = 'white';
    counterElm.style.padding = '5px 10px';
    counterElm.style.borderRadius = '5px';
    counterElm.style.zIndex = 1000;
    counterElm.style.display = 'none';
    counterElm.style.cursor = 'pointer';

    if (count > 0) {
        counterElm.innerText = `Christmas Trees: ${count} 🎄`;
        counterElm.style.display = 'block';
    }
    if (count >= totalTrees) {
        counterElm.innerText = completedText;

        const button = document.createElement('button');
        button.innerText = 'Reset';
        button.onclick = () => {
            window.localStorage.removeItem('christmasTreeCounter');
            location.reload();
        };
        button.style.backgroundColor = 'green';
        button.style.borderRadius = '1em';
        button.style.color = 'white';
        button.style.padding = '0.5em 1em';
        button.style.cursor = 'pointer';
        counterElm.appendChild(button);
    }

    document.body.appendChild(counterElm);

    return () => {
        count += 1;
        window.localStorage.setItem('christmasTreeCounter', count.toString());
        counterElm.innerText = `Christmas Trees: ${count} 🎄`;
        counterElm.style.display = 'block';

        if (count >= totalTrees) {
            counterElm.style.fontSize = '1.5em';
            counterElm.innerText = completedText;
        }
    };
}


/**
 * Create a tree element and add it to the page
 */
function createTree({ width, height, onClick }) {
    const treeUrl = '/assets/hellochristmas.svg';

    const tree = document.createElement('img');
    tree.src = treeUrl;
    tree.width = width;
    tree.height = height;
    tree.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Animate the tree to the bottom right of the screen
        tree.style.transition = 'transform 0.5s ease';
        tree.style.transform = `translate(${window.innerWidth - tree.getBoundingClientRect().left - width}px, ${window.innerHeight - tree.getBoundingClientRect().top - height}px) scale(0.01)`;
        onClick();
    });
    tree.style.position = 'fixed';
    tree.style.left = Math.random() * (window.innerWidth - width) + 'px';
    tree.style.top = Math.random() * (window.innerHeight - height) + 'px';
    tree.style.zIndex = 1000;
    tree.style.cursor = 'pointer';
    tree.style.userSelect = 'none';

    document.body.appendChild(tree);
}
