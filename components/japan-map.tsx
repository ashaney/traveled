'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { japanPrefectures } from '@/data/japan';
import { useVisits } from '@/hooks/useVisits';
import { RATING_COLORS, VisitRating } from '@/types';

interface JapanMapProps {
  className?: string;
  onRegionClick?: (regionId: string) => void;
}

export function JapanMap({ className, onRegionClick }: JapanMapProps) {
  const { getVisitByRegion } = useVisits();
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

  const getRegionColor = (regionId: string) => {
    const visit = getVisitByRegion(regionId);
    const rating = visit?.rating ?? 0;
    return RATING_COLORS[rating as VisitRating];
  };

  const getRegionName = (regionId: string) => {
    const region = japanPrefectures.regions.find(r => r.id === regionId);
    return region?.name || regionId;
  };

  // Map SVG IDs to our prefecture IDs
  const mapClickHandler = (svgId: string) => {
    const idMap: Record<string, string> = {
      'Hokkaido_2': 'hokkaido',
      'Aomori': 'aomori',
      'Iwate': 'iwate', 
      'Miyagi': 'miyagi',
      'Akita': 'akita',
      'Yamagata': 'yamagata',
      'Fukushima': 'fukushima',
      'Ibaraki': 'ibaraki',
      'Tochigi': 'tochigi',
      'Gunma': 'gunma',
      'Saitama': 'saitama',
      'Chiba': 'chiba',
      'Tokyo': 'tokyo',
      'Kanagawa': 'kanagawa',
      'Niigata': 'niigata',
      'Toyama': 'toyama',
      'Ishikawa': 'ishikawa',
      'Fukui': 'fukui',
      'Yamanashi': 'yamanashi',
      'Nagano': 'nagano',
      'Gifu': 'gifu',
      'Shizuoka': 'shizuoka',
      'Aichi': 'aichi',
      'Mie': 'mie',
      'Shiga': 'shiga',
      'Kyoto': 'kyoto',
      'Osaka': 'osaka',
      'Hyogo': 'hyogo',
      'Nara': 'nara',
      'Wakayama': 'wakayama',
      'Tottori': 'tottori',
      'Shimane': 'shimane',
      'Okayama': 'okayama',
      'Hiroshima': 'hiroshima',
      'Yamaguchi': 'yamaguchi',
      'Tokushima': 'tokushima',
      'Kagawa': 'kagawa',
      'Ehime': 'ehime',
      'Kochi': 'kochi',
      'Fukuoka': 'fukuoka',
      'Saga': 'saga',
      'Nagasaki': 'nagasaki',
      'Kumamoto': 'kumamoto',
      'Oita': 'oita',
      'Miyazaki': 'miyazaki',
      'Kagoshima': 'kagoshima',
      'Okinawa': 'okinawa'
    };
    
    const prefectureId = idMap[svgId] || svgId.toLowerCase();
    onRegionClick?.(prefectureId);
  };

  const getHexagonColor = (svgId: string) => {
    const idMap: Record<string, string> = {
      'Hokkaido_2': 'hokkaido',
      'Aomori': 'aomori',
      'Iwate': 'iwate', 
      'Miyagi': 'miyagi',
      'Akita': 'akita',
      'Yamagata': 'yamagata',
      'Fukushima': 'fukushima',
      'Ibaraki': 'ibaraki',
      'Tochigi': 'tochigi',
      'Gunma': 'gunma',
      'Saitama': 'saitama',
      'Chiba': 'chiba',
      'Tokyo': 'tokyo',
      'Kanagawa': 'kanagawa',
      'Niigata': 'niigata',
      'Toyama': 'toyama',
      'Ishikawa': 'ishikawa',
      'Fukui': 'fukui',
      'Yamanashi': 'yamanashi',
      'Nagano': 'nagano',
      'Gifu': 'gifu',
      'Shizuoka': 'shizuoka',
      'Aichi': 'aichi',
      'Mie': 'mie',
      'Shiga': 'shiga',
      'Kyoto': 'kyoto',
      'Osaka': 'osaka',
      'Hyogo': 'hyogo',
      'Nara': 'nara',
      'Wakayama': 'wakayama',
      'Tottori': 'tottori',
      'Shimane': 'shimane',
      'Okayama': 'okayama',
      'Hiroshima': 'hiroshima',
      'Yamaguchi': 'yamaguchi',
      'Tokushima': 'tokushima',
      'Kagawa': 'kagawa',
      'Ehime': 'ehime',
      'Kochi': 'kochi',
      'Fukuoka': 'fukuoka',
      'Saga': 'saga',
      'Nagasaki': 'nagasaki',
      'Kumamoto': 'kumamoto',
      'Oita': 'oita',
      'Miyazaki': 'miyazaki',
      'Kagoshima': 'kagoshima',
      'Okinawa': 'okinawa'
    };
    
    const prefectureId = idMap[svgId] || svgId.toLowerCase();
    return getRegionColor(prefectureId);
  };

  return (
    <div className={cn("relative", className)}>
      <svg width="1513" height="982" viewBox="0 0 1513 982" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
        <g clipPath="url(#clip0_3_6)">
          {/* Kyushu */}
          <path id="Okinawa" d="M76.9425 934.939C77.428 937.827 76.3931 940.761 74.2032 942.705L69.3613 947.003C67.0497 949.054 63.8065 949.69 60.8917 948.662L55.5805 946.788C52.6656 945.76 50.5378 943.231 50.025 940.183L48.9515 933.799C48.4658 930.911 49.5009 927.977 51.6908 926.032L56.5317 921.735C58.8434 919.683 62.0873 919.048 65.0023 920.076L70.3135 921.949C73.2284 922.978 75.3553 925.507 75.8681 928.555L76.9425 934.939Z" fill={getHexagonColor("Okinawa")} className={cn("cursor-pointer stroke-2 stroke-gray-400 dark:stroke-gray-600 transition-all duration-200", hoveredRegion === "Okinawa" && "stroke-black dark:stroke-white opacity-80")} onMouseEnter={() => setHoveredRegion("Okinawa")} onMouseLeave={() => setHoveredRegion(null)} onClick={() => mapClickHandler("Okinawa")} />
          
          <path id="Kagoshima" d="M296.722 812.875C297.207 815.763 296.172 818.699 293.982 820.643L277.464 835.305C275.153 837.356 271.909 837.992 268.994 836.964L249.417 830.058C246.502 829.03 244.374 826.501 243.861 823.452L240.198 801.672C239.712 798.784 240.748 795.849 242.938 793.905L259.454 779.244C261.766 777.192 265.01 776.556 267.925 777.584L287.503 784.489C290.418 785.518 292.544 788.048 293.057 791.096L296.722 812.875Z" fill={getHexagonColor("Kagoshima")} className={cn("cursor-pointer stroke-2 stroke-gray-400 dark:stroke-gray-600 transition-all duration-200", hoveredRegion === "Kagoshima" && "stroke-black dark:stroke-white opacity-80")} onMouseEnter={() => setHoveredRegion("Kagoshima")} onMouseLeave={() => setHoveredRegion(null)} onClick={() => mapClickHandler("Kagoshima")} />
          
          <path id="Miyazaki" d="M348.952 794.421C349.438 797.309 348.403 800.244 346.213 802.188L329.551 816.978C327.24 819.03 323.996 819.665 321.081 818.636L301.328 811.669C298.413 810.641 296.285 808.112 295.773 805.063L292.077 783.094C291.591 780.206 292.626 777.271 294.817 775.327L311.478 760.537C313.789 758.485 317.033 757.85 319.948 758.878L339.701 765.845C342.616 766.874 344.744 769.403 345.256 772.451L348.952 794.421Z" className={cn("cursor-pointer stroke-2 stroke-gray-400 dark:stroke-gray-600 transition-all duration-200", getHexagonColor("Miyazaki"), hoveredRegion === "Miyazaki" && "stroke-black dark:stroke-white opacity-80")} onMouseEnter={() => setHoveredRegion("Miyazaki")} onMouseLeave={() => setHoveredRegion(null)} onClick={() => mapClickHandler("Miyazaki")} />
          
          <path id="Oita" d="M355.423 740.125C355.909 743.013 354.874 745.948 352.684 747.892L338.97 760.064C336.659 762.116 333.415 762.751 330.501 761.723L314.349 756.026C311.434 754.998 309.307 752.469 308.794 749.421L305.753 731.338C305.267 728.451 306.302 725.516 308.492 723.572L322.205 711.399C324.517 709.347 327.76 708.712 330.675 709.74L346.826 715.437C349.741 716.465 351.868 718.995 352.381 722.043L355.423 740.125Z" className={cn("cursor-pointer stroke-2 stroke-gray-400 dark:stroke-gray-600 transition-all duration-200", getHexagonColor("Oita"), hoveredRegion === "Oita" && "stroke-black dark:stroke-white opacity-80")} onMouseEnter={() => setHoveredRegion("Oita")} onMouseLeave={() => setHoveredRegion(null)} onClick={() => mapClickHandler("Oita")} />
          
          <path id="Kumamoto" d="M309.618 757.389C310.104 760.277 309.069 763.212 306.879 765.156L289.295 780.763C286.984 782.815 283.741 783.45 280.826 782.422L259.947 775.058C257.032 774.03 254.904 771.5 254.391 768.452L250.491 745.267C250.006 742.379 251.041 739.445 253.231 737.501L270.813 721.893C273.125 719.841 276.369 719.206 279.284 720.234L300.163 727.599C303.078 728.627 305.204 731.156 305.717 734.204L309.618 757.389Z" className={cn("cursor-pointer stroke-2 stroke-gray-400 dark:stroke-gray-600 transition-all duration-200", getHexagonColor("Kumamoto"), hoveredRegion === "Kumamoto" && "stroke-black dark:stroke-white opacity-80")} onMouseEnter={() => setHoveredRegion("Kumamoto")} onMouseLeave={() => setHoveredRegion(null)} onClick={() => mapClickHandler("Kumamoto")} />
          
          <path id="Nagasaki" d="M275.064 712.957C275.457 715.859 274.328 718.759 272.077 720.632L261.255 729.635C258.879 731.612 255.617 732.144 252.737 731.023L240.622 726.308C237.741 725.187 235.697 722.59 235.282 719.527L233.392 705.578C232.999 702.676 234.128 699.776 236.379 697.903L247.2 688.9C249.576 686.923 252.838 686.392 255.718 687.513L267.834 692.228C270.714 693.349 272.759 695.945 273.174 699.008L275.064 712.957Z" className={cn("cursor-pointer stroke-2 stroke-gray-400 dark:stroke-gray-600 transition-all duration-200", getHexagonColor("Nagasaki"), hoveredRegion === "Nagasaki" && "stroke-black dark:stroke-white opacity-80")} onMouseEnter={() => setHoveredRegion("Nagasaki")} onMouseLeave={() => setHoveredRegion(null)} onClick={() => mapClickHandler("Nagasaki")} />
          
          <path id="Saga" d="M322.959 704.782C323.444 707.67 322.409 710.605 320.219 712.549L306.667 724.578C304.355 726.63 301.111 727.266 298.196 726.238L282.241 720.611C279.326 719.582 277.2 717.052 276.687 714.004L273.681 696.134C273.195 693.246 274.23 690.312 276.42 688.368L289.973 676.337C292.284 674.285 295.528 673.65 298.443 674.678L314.397 680.305C317.312 681.334 319.44 683.863 319.953 686.911L322.959 704.782Z" className={cn("cursor-pointer stroke-2 stroke-gray-400 dark:stroke-gray-600 transition-all duration-200", getHexagonColor("Saga"), hoveredRegion === "Saga" && "stroke-black dark:stroke-white opacity-80")} onMouseEnter={() => setHoveredRegion("Saga")} onMouseLeave={() => setHoveredRegion(null)} onClick={() => mapClickHandler("Saga")} />
          
          <path id="Fukuoka" d="M370.423 692.125C370.909 695.013 369.874 697.948 367.684 699.892L353.97 712.064C351.659 714.116 348.415 714.751 345.501 713.723L329.349 708.026C326.434 706.998 324.307 704.469 323.794 701.421L320.753 683.338C320.267 680.451 321.302 677.516 323.492 675.572L337.205 663.399C339.517 661.347 342.76 660.712 345.675 661.74L361.826 667.437C364.741 668.465 366.868 670.995 367.381 674.043L370.423 692.125Z" className={cn("cursor-pointer stroke-2 stroke-gray-400 dark:stroke-gray-600 transition-all duration-200", getHexagonColor("Fukuoka"), hoveredRegion === "Fukuoka" && "stroke-black dark:stroke-white opacity-80")} onMouseEnter={() => setHoveredRegion("Fukuoka")} onMouseLeave={() => setHoveredRegion(null)} onClick={() => mapClickHandler("Fukuoka")} />

          {/* Shikoku */}
          <path id="Kochi" d="M599.472 772.021C599.377 774.948 597.782 777.62 595.25 779.092L568.559 794.617C565.887 796.171 562.581 796.152 559.927 794.568L534.789 779.559C532.135 777.974 530.551 775.073 530.651 771.984L531.654 741.123C531.749 738.196 533.345 735.524 535.876 734.051L562.567 718.527C565.239 716.973 568.544 716.992 571.198 718.576L596.337 733.585C598.991 735.17 600.576 738.07 600.475 741.16L599.472 772.021Z" className={cn("cursor-pointer stroke-2 stroke-gray-400 dark:stroke-gray-600 transition-all duration-200", getHexagonColor("Kochi"), hoveredRegion === "Kochi" && "stroke-black dark:stroke-white opacity-80")} onMouseEnter={() => setHoveredRegion("Kochi")} onMouseLeave={() => setHoveredRegion(null)} onClick={() => mapClickHandler("Kochi")} />
          
          <path id="Ehime" d="M635.769 713.573C635.673 716.499 634.078 719.171 631.547 720.644L606.355 735.295C603.683 736.849 600.378 736.831 597.724 735.247L574.028 721.1C571.375 719.515 569.791 716.614 569.891 713.525L570.838 684.398C570.933 681.471 572.528 678.799 575.06 677.327L600.251 662.675C602.922 661.121 606.228 661.139 608.882 662.723L632.577 676.87C635.231 678.455 636.815 681.356 636.715 684.445L635.769 713.573Z" className={cn("cursor-pointer stroke-2 stroke-gray-400 dark:stroke-gray-600 transition-all duration-200", getHexagonColor("Ehime"), hoveredRegion === "Ehime" && "stroke-black dark:stroke-white opacity-80")} onMouseEnter={() => setHoveredRegion("Ehime")} onMouseLeave={() => setHoveredRegion(null)} onClick={() => mapClickHandler("Ehime")} />
          
          <path id="Tokushima" d="M666.352 769.32C666.257 772.247 664.662 774.918 662.13 776.391L636.736 791.161C634.064 792.715 630.759 792.696 628.105 791.112L604.215 776.849C601.561 775.264 599.977 772.363 600.078 769.274L601.032 739.912C601.127 736.985 602.722 734.314 605.253 732.841L630.647 718.072C633.319 716.518 636.624 716.536 639.278 718.121L663.168 732.384C665.822 733.969 667.407 736.869 667.306 739.958L666.352 769.32Z" className={cn("cursor-pointer stroke-2 stroke-gray-400 dark:stroke-gray-600 transition-all duration-200", getHexagonColor("Tokushima"), hoveredRegion === "Tokushima" && "stroke-black dark:stroke-white opacity-80")} onMouseEnter={() => setHoveredRegion("Tokushima")} onMouseLeave={() => setHoveredRegion(null)} onClick={() => mapClickHandler("Tokushima")} />
          
          <path id="Kagawa" d="M692.897 712.652C692.802 715.579 691.206 718.252 688.675 719.724L667.431 732.08C664.759 733.634 661.454 733.615 658.801 732.031L638.905 720.152C636.251 718.568 634.666 715.667 634.766 712.578L635.565 688.015C635.66 685.088 637.256 682.416 639.787 680.944L661.03 668.588C663.702 667.034 667.008 667.053 669.662 668.637L689.557 680.516C692.211 682.1 693.795 685.001 693.695 688.091L692.897 712.652Z" className={cn("cursor-pointer stroke-2 stroke-gray-400 dark:stroke-gray-600 transition-all duration-200", getHexagonColor("Kagawa"), hoveredRegion === "Kagawa" && "stroke-black dark:stroke-white opacity-80")} onMouseEnter={() => setHoveredRegion("Kagawa")} onMouseLeave={() => setHoveredRegion(null)} onClick={() => mapClickHandler("Kagawa")} />

          {/* Chugoku */}
          <path id="Yamaguchi" d="M437.513 605.681C440.185 606.881 442.051 609.372 442.451 612.273L447.677 650.134C448.099 653.196 446.827 656.246 444.353 658.099L415.226 679.918C412.752 681.771 409.467 682.134 406.647 680.868L371.783 665.209C369.111 664.01 367.245 661.519 366.845 658.618L361.62 620.757C361.197 617.695 362.469 614.644 364.943 612.791L394.07 590.973C396.544 589.12 399.829 588.756 402.649 590.023L437.513 605.681Z" className={cn("cursor-pointer stroke-2 stroke-gray-400 dark:stroke-gray-600 transition-all duration-200", getHexagonColor("Yamaguchi"), hoveredRegion === "Yamaguchi" && "stroke-black dark:stroke-white opacity-80")} onMouseEnter={() => setHoveredRegion("Yamaguchi")} onMouseLeave={() => setHoveredRegion(null)} onClick={() => mapClickHandler("Yamaguchi")} />

          <path id="Hiroshima" d="M518.176 598.026C520.847 599.225 522.713 601.716 523.114 604.618L528.339 642.478C528.761 645.54 527.489 648.591 525.015 650.444L495.888 672.262C493.415 674.115 490.129 674.479 487.31 673.212L452.445 657.554C449.773 656.354 447.908 653.863 447.507 650.962L442.282 613.101C441.859 610.039 443.132 606.989 445.605 605.136L474.732 583.317C477.206 581.464 480.491 581.101 483.311 582.367L518.176 598.026Z" className={cn("cursor-pointer stroke-2 stroke-gray-400 dark:stroke-gray-600 transition-all duration-200", getHexagonColor("Hiroshima"), hoveredRegion === "Hiroshima" && "stroke-black dark:stroke-white opacity-80")} onMouseEnter={() => setHoveredRegion("Hiroshima")} onMouseLeave={() => setHoveredRegion(null)} onClick={() => mapClickHandler("Hiroshima")} />

          <path id="Okayama" d="M608.42 635.7C608.716 638.614 607.492 641.475 605.18 643.272L575.004 666.728C572.564 668.625 569.286 669.048 566.444 667.833L532.985 653.517C530.143 652.301 528.186 649.638 527.873 646.563L524.001 608.54C523.705 605.626 524.929 602.765 527.241 600.967L557.417 577.512C559.857 575.615 563.135 575.192 565.977 576.407L599.436 590.723C602.278 591.939 604.235 594.602 604.548 597.677L608.42 635.7Z" className={cn("cursor-pointer stroke-2 stroke-gray-400 dark:stroke-gray-600 transition-all duration-200", getHexagonColor("Okayama"), hoveredRegion === "Okayama" && "stroke-black dark:stroke-white opacity-80")} onMouseEnter={() => setHoveredRegion("Okayama")} onMouseLeave={() => setHoveredRegion(null)} onClick={() => mapClickHandler("Okayama")} />

          <path id="Shimane" d="M552.657 524.398C555.328 525.598 557.194 528.089 557.595 530.99L562.82 568.85C563.243 571.912 561.97 574.963 559.497 576.816L530.37 598.634C527.896 600.488 524.611 600.851 521.791 599.584L486.926 583.926C484.255 582.726 482.389 580.235 481.988 577.334L476.763 539.474C476.34 536.412 477.613 533.361 480.087 531.508L509.213 509.69C511.687 507.836 514.972 507.473 517.792 508.739L552.657 524.398Z" className={cn("cursor-pointer stroke-2 stroke-gray-400 dark:stroke-gray-600 transition-all duration-200", getHexagonColor("Shimane"), hoveredRegion === "Shimane" && "stroke-black dark:stroke-white opacity-80")} onMouseEnter={() => setHoveredRegion("Shimane")} onMouseLeave={() => setHoveredRegion(null)} onClick={() => mapClickHandler("Shimane")} />

          <path id="Tottori" d="M642.295 559.634C642.591 562.547 641.367 565.409 639.055 567.206L608.879 590.662C606.439 592.559 603.161 592.982 600.319 591.766L566.86 577.451C564.018 576.235 562.061 573.572 561.748 570.497L557.876 532.474C557.579 529.56 558.804 526.699 561.116 524.901L591.292 501.446C593.732 499.549 597.01 499.125 599.852 500.341L633.311 514.657C636.152 515.873 638.11 518.536 638.423 521.611L642.295 559.634Z" className={cn("cursor-pointer stroke-2 stroke-gray-400 dark:stroke-gray-600 transition-all duration-200", getHexagonColor("Tottori"), hoveredRegion === "Tottori" && "stroke-black dark:stroke-white opacity-80")} onMouseEnter={() => setHoveredRegion("Tottori")} onMouseLeave={() => setHoveredRegion(null)} onClick={() => mapClickHandler("Tottori")} />

          {/* Kansai */}
          <path id="Wakayama" d="M800.491 662.972C800.841 665.88 799.67 668.763 797.392 670.603L773.01 690.292C770.605 692.234 767.336 692.717 764.472 691.554L736.932 680.37C734.068 679.208 732.061 676.581 731.69 673.513L727.939 642.4C727.588 639.493 728.759 636.609 731.038 634.769L755.418 615.08C757.823 613.138 761.093 612.655 763.957 613.818L791.498 625.002C794.361 626.165 796.368 628.791 796.738 631.859L800.491 662.972Z" className={cn("cursor-pointer stroke-2 stroke-gray-400 dark:stroke-gray-600 transition-all duration-200", getHexagonColor("Wakayama"), hoveredRegion === "Wakayama" && "stroke-black dark:stroke-white opacity-80")} onMouseEnter={() => setHoveredRegion("Wakayama")} onMouseLeave={() => setHoveredRegion(null)} onClick={() => mapClickHandler("Wakayama")} />

          <path id="Nara" d="M761.948 604.927C762.298 607.834 761.127 610.718 758.849 612.558L737.961 629.425C735.556 631.366 732.287 631.85 729.423 630.687L705.915 621.141C703.051 619.978 701.043 617.352 700.673 614.283L697.459 587.629C697.109 584.721 698.28 581.838 700.558 579.998L721.445 563.131C723.849 561.189 727.12 560.705 729.984 561.868L753.492 571.415C756.356 572.578 758.363 575.204 758.733 578.273L761.948 604.927Z" className={cn("cursor-pointer stroke-2 stroke-gray-400 dark:stroke-gray-600 transition-all duration-200", getHexagonColor("Nara"), hoveredRegion === "Nara" && "stroke-black dark:stroke-white opacity-80")} onMouseEnter={() => setHoveredRegion("Nara")} onMouseLeave={() => setHoveredRegion(null)} onClick={() => mapClickHandler("Nara")} />

          <path id="Hyogo" d="M648.742 574.65C646.096 573.395 644.282 570.867 643.941 567.958L640.079 534.98C639.72 531.91 641.055 528.886 643.567 527.084L669.187 508.703C671.699 506.901 674.991 506.605 677.783 507.93L707.786 522.154C710.432 523.408 712.246 525.937 712.587 528.845L716.45 561.824C716.809 564.894 715.474 567.917 712.962 569.719L687.342 588.1C684.83 589.902 681.538 590.199 678.745 588.875L648.742 574.65Z" className={cn("cursor-pointer stroke-2 stroke-gray-400 dark:stroke-gray-600 transition-all duration-200", getHexagonColor("Hyogo"), hoveredRegion === "Hyogo" && "stroke-black dark:stroke-white opacity-80")} onMouseEnter={() => setHoveredRegion("Hyogo")} onMouseLeave={() => setHoveredRegion(null)} onClick={() => mapClickHandler("Hyogo")} />

          <path id="Osaka" d="M702.497 627.959C702.845 630.862 701.676 633.739 699.404 635.578L678.734 652.299C676.329 654.245 673.057 654.731 670.19 653.567L646.985 644.143C644.118 642.979 642.111 640.35 641.743 637.278L638.583 610.88C638.236 607.978 639.405 605.1 641.677 603.262L662.347 586.54C664.752 584.594 668.024 584.109 670.891 585.273L694.096 594.696C696.963 595.86 698.97 598.49 699.338 601.561L702.497 627.959Z" className={cn("cursor-pointer stroke-2 stroke-gray-400 dark:stroke-gray-600 transition-all duration-200", getHexagonColor("Osaka"), hoveredRegion === "Osaka" && "stroke-black dark:stroke-white opacity-80")} onMouseEnter={() => setHoveredRegion("Osaka")} onMouseLeave={() => setHoveredRegion(null)} onClick={() => mapClickHandler("Osaka")} />

          <path id="Kyoto" d="M789.892 541.078C790.173 543.993 788.933 546.848 786.611 548.633L759.3 569.624C756.849 571.507 753.568 571.912 750.733 570.68L720.708 557.639C717.873 556.407 715.93 553.734 715.634 550.657L712.332 516.37C712.052 513.455 713.292 510.6 715.614 508.815L742.924 487.825C745.375 485.942 748.655 485.536 751.49 486.768L781.516 499.809C784.351 501.04 786.294 503.715 786.591 506.792L789.892 541.078Z" className={cn("cursor-pointer stroke-2 stroke-gray-400 dark:stroke-gray-600 transition-all duration-200", getHexagonColor("Kyoto"), hoveredRegion === "Kyoto" && "stroke-black dark:stroke-white opacity-80")} onMouseEnter={() => setHoveredRegion("Kyoto")} onMouseLeave={() => setHoveredRegion(null)} onClick={() => mapClickHandler("Kyoto")} />

          <path id="Shiga" d="M853.153 528.972C853.504 531.879 852.333 534.762 850.055 536.602L828.022 554.394C825.617 556.336 822.348 556.819 819.484 555.656L794.654 545.573C791.79 544.41 789.783 541.784 789.413 538.716L786.023 510.6C785.672 507.693 786.843 504.81 789.121 502.97L811.154 485.178C813.559 483.236 816.828 482.752 819.692 483.915L844.522 493.998C847.386 495.161 849.393 497.787 849.763 500.856L853.153 528.972Z" className={cn("cursor-pointer stroke-2 stroke-gray-400 dark:stroke-gray-600 transition-all duration-200", getHexagonColor("Shiga"), hoveredRegion === "Shiga" && "stroke-black dark:stroke-white opacity-80")} onMouseEnter={() => setHoveredRegion("Shiga")} onMouseLeave={() => setHoveredRegion(null)} onClick={() => mapClickHandler("Shiga")} />

          <path id="Mie" d="M834.041 597.479C834.391 600.386 833.22 603.27 830.942 605.109L805.249 625.857C802.844 627.799 799.575 628.282 796.711 627.119L767.658 615.321C764.794 614.158 762.788 611.532 762.417 608.464L758.463 575.677C758.113 572.77 759.284 569.887 761.562 568.047L787.255 547.3C789.66 545.358 792.929 544.875 795.793 546.037L824.846 557.835C827.71 558.998 829.716 561.624 830.087 564.693L834.041 597.479Z" className={cn("cursor-pointer stroke-2 stroke-gray-400 dark:stroke-gray-600 transition-all duration-200", getHexagonColor("Mie"), hoveredRegion === "Mie" && "stroke-black dark:stroke-white opacity-80")} onMouseEnter={() => setHoveredRegion("Mie")} onMouseLeave={() => setHoveredRegion(null)} onClick={() => mapClickHandler("Mie")} />

          {/* Chubu */}
          <path id="Aichi" d="M915.107 581.827C915.57 584.718 914.511 587.645 912.306 589.572L883.524 614.719C881.196 616.752 877.948 617.363 875.041 616.312L840.817 603.938C837.91 602.887 835.804 600.34 835.315 597.288L829.27 559.549C828.807 556.658 829.865 553.731 832.071 551.804L860.853 526.657C863.18 524.624 866.428 524.013 869.335 525.064L903.56 537.438C906.466 538.489 908.573 541.036 909.062 544.088L915.107 581.827Z" className={cn("cursor-pointer stroke-2 stroke-gray-400 dark:stroke-gray-600 transition-all duration-200", getHexagonColor("Aichi"), hoveredRegion === "Aichi" && "stroke-black dark:stroke-white opacity-80")} onMouseEnter={() => setHoveredRegion("Aichi")} onMouseLeave={() => setHoveredRegion(null)} onClick={() => mapClickHandler("Aichi")} />

          <path id="Shizuoka" d="M964.062 647.462C964.525 650.353 963.467 653.28 961.261 655.207L932.48 680.353C930.152 682.387 926.904 682.998 923.997 681.947L889.773 669.573C886.866 668.521 884.759 665.975 884.27 662.923L878.226 625.184C877.763 622.292 878.821 619.365 881.026 617.439L909.808 592.292C912.136 590.258 915.384 589.648 918.291 590.699L952.515 603.073C955.422 604.124 957.528 606.671 958.017 609.723L964.062 647.462Z" className={cn("cursor-pointer stroke-2 stroke-gray-400 dark:stroke-gray-600 transition-all duration-200", getHexagonColor("Shizuoka"), hoveredRegion === "Shizuoka" && "stroke-black dark:stroke-white opacity-80")} onMouseEnter={() => setHoveredRegion("Shizuoka")} onMouseLeave={() => setHoveredRegion(null)} onClick={() => mapClickHandler("Shizuoka")} />

          <path id="Gifu" d="M945.939 504.087C946.403 506.979 945.344 509.906 943.139 511.833L914.357 536.979C912.029 539.013 908.781 539.623 905.874 538.572L871.65 526.198C868.743 525.147 866.637 522.6 866.148 519.548L860.103 481.81C859.64 478.918 860.698 475.991 862.904 474.064L891.685 448.918C894.013 446.884 897.261 446.273 900.168 447.324L934.392 459.699C937.299 460.75 939.406 463.296 939.895 466.348L945.939 504.087Z" className={cn("cursor-pointer stroke-2 stroke-gray-400 dark:stroke-gray-600 transition-all duration-200", getHexagonColor("Gifu"), hoveredRegion === "Gifu" && "stroke-black dark:stroke-white opacity-80")} onMouseEnter={() => setHoveredRegion("Gifu")} onMouseLeave={() => setHoveredRegion(null)} onClick={() => mapClickHandler("Gifu")} />

          <path id="Nagano" d="M1026.01 490.383C1026.47 493.274 1025.41 496.201 1023.21 498.128L994.426 523.274C992.098 525.308 988.85 525.919 985.943 524.868L951.719 512.494C948.812 511.442 946.705 508.896 946.217 505.844L940.172 468.105C939.709 465.213 940.767 462.286 942.972 460.36L971.754 435.213C974.082 433.179 977.33 432.569 980.237 433.62L1014.46 445.994C1017.37 447.045 1019.47 449.592 1019.96 452.644L1026.01 490.383Z" className={cn("cursor-pointer stroke-2 stroke-gray-400 dark:stroke-gray-600 transition-all duration-200", getHexagonColor("Nagano"), hoveredRegion === "Nagano" && "stroke-black dark:stroke-white opacity-80")} onMouseEnter={() => setHoveredRegion("Nagano")} onMouseLeave={() => setHoveredRegion(null)} onClick={() => mapClickHandler("Nagano")} />

          <path id="Yamanashi" d="M995.135 569.263C995.598 572.154 994.54 575.081 992.335 577.008L963.553 602.155C961.225 604.188 957.977 604.799 955.07 603.748L920.846 591.374C917.939 590.323 915.832 587.776 915.344 584.724L909.299 546.985C908.836 544.093 909.894 541.166 912.099 539.24L940.881 514.093C943.209 512.059 946.457 511.449 949.364 512.5L983.588 524.874C986.495 525.925 988.602 528.472 989.091 531.524L995.135 569.263Z" className={cn("cursor-pointer stroke-2 stroke-gray-400 dark:stroke-gray-600 transition-all duration-200", getHexagonColor("Yamanashi"), hoveredRegion === "Yamanashi" && "stroke-black dark:stroke-white opacity-80")} onMouseEnter={() => setHoveredRegion("Yamanashi")} onMouseLeave={() => setHoveredRegion(null)} onClick={() => mapClickHandler("Yamanashi")} />

          <path id="Fukui" d="M976.69 425.829C977.154 428.721 976.095 431.648 973.89 433.574L945.108 458.721C942.78 460.755 939.532 461.365 936.625 460.314L902.401 447.94C899.494 446.889 897.388 444.342 896.899 441.29L890.854 403.551C890.391 400.66 891.449 397.733 893.655 395.806L922.436 370.659C924.764 368.626 928.012 368.015 930.919 369.066L965.143 381.44C968.05 382.491 970.157 385.038 970.646 388.09L976.69 425.829Z" className={cn("cursor-pointer stroke-2 stroke-gray-400 dark:stroke-gray-600 transition-all duration-200", getHexagonColor("Fukui"), hoveredRegion === "Fukui" && "stroke-black dark:stroke-white opacity-80")} onMouseEnter={() => setHoveredRegion("Fukui")} onMouseLeave={() => setHoveredRegion(null)} onClick={() => mapClickHandler("Fukui")} />

          <path id="Ishikawa" d="M1007.76 347.768C1008.23 350.659 1007.17 353.586 1004.96 355.513L976.181 380.66C973.854 382.693 970.605 383.304 967.698 382.253L933.474 369.879C930.567 368.828 928.461 366.281 927.972 363.229L921.927 325.49C921.464 322.598 922.522 319.672 924.728 317.745L953.51 292.598C955.837 290.565 959.086 289.954 961.992 291.005L996.217 303.379C999.123 304.43 1001.23 306.977 1001.72 310.029L1007.76 347.768Z" className={cn("cursor-pointer stroke-2 stroke-gray-400 dark:stroke-gray-600 transition-all duration-200", getHexagonColor("Ishikawa"), hoveredRegion === "Ishikawa" && "stroke-black dark:stroke-white opacity-80")} onMouseEnter={() => setHoveredRegion("Ishikawa")} onMouseLeave={() => setHoveredRegion(null)} onClick={() => mapClickHandler("Ishikawa")} />

          <path id="Toyama" d="M1057.21 412.522C1057.67 415.414 1056.61 418.341 1054.41 420.268L1025.62 445.414C1023.3 447.448 1020.05 448.058 1017.14 447.007L982.918 434.633C980.011 433.582 977.905 431.035 977.416 427.983L971.371 390.245C970.908 387.353 971.966 384.426 974.172 382.499L1002.95 357.353C1005.28 355.319 1008.53 354.708 1011.44 355.759L1045.66 368.134C1048.57 369.185 1050.67 371.731 1051.16 374.784L1057.21 412.522Z" className={cn("cursor-pointer stroke-2 stroke-gray-400 dark:stroke-gray-600 transition-all duration-200", getHexagonColor("Toyama"), hoveredRegion === "Toyama" && "stroke-black dark:stroke-white opacity-80")} onMouseEnter={() => setHoveredRegion("Toyama")} onMouseLeave={() => setHoveredRegion(null)} onClick={() => mapClickHandler("Toyama")} />

          <path id="Niigata" d="M1136.78 395.224C1137.24 398.115 1136.18 401.042 1133.98 402.969L1105.19 428.116C1102.87 430.149 1099.62 430.76 1096.71 429.709L1062.49 417.335C1059.58 416.284 1057.47 413.737 1056.98 410.685L1050.94 372.946C1050.48 370.054 1051.54 367.128 1053.74 365.201L1082.52 340.054C1084.85 338.021 1088.1 337.41 1091.01 338.461L1125.23 350.835C1128.14 351.886 1130.24 354.433 1130.73 357.485L1136.78 395.224Z" className={cn("cursor-pointer stroke-2 stroke-gray-400 dark:stroke-gray-600 transition-all duration-200", getHexagonColor("Niigata"), hoveredRegion === "Niigata" && "stroke-black dark:stroke-white opacity-80")} onMouseEnter={() => setHoveredRegion("Niigata")} onMouseLeave={() => setHoveredRegion(null)} onClick={() => mapClickHandler("Niigata")} />

          {/* Kanto */}
          <path id="Kanagawa" d="M1255.44 571.112C1255.95 573.995 1254.95 576.939 1252.78 578.905L1227.66 601.647C1225.37 603.722 1222.14 604.389 1219.21 603.391L1188.75 592.988C1185.83 591.988 1183.68 589.48 1183.13 586.438L1177.18 553.086C1176.66 550.203 1177.67 547.258 1179.84 545.292L1204.95 522.55C1207.24 520.476 1210.48 519.808 1213.4 520.807L1243.86 531.21C1246.79 532.209 1248.94 534.717 1249.48 537.76L1255.44 571.112Z" className={cn("cursor-pointer stroke-2 stroke-gray-400 dark:stroke-gray-600 transition-all duration-200", getHexagonColor("Kanagawa"), hoveredRegion === "Kanagawa" && "stroke-black dark:stroke-white opacity-80")} onMouseEnter={() => setHoveredRegion("Kanagawa")} onMouseLeave={() => setHoveredRegion(null)} onClick={() => mapClickHandler("Kanagawa")} />

          <path id="Tokyo" d="M1241.31 497.017C1241.82 499.895 1240.81 502.834 1238.65 504.799L1222.91 519.077C1220.62 521.156 1217.38 521.825 1214.45 520.825L1195.64 514.399C1192.71 513.399 1190.55 510.887 1190.01 507.841L1186.3 486.919C1185.79 484.041 1186.79 481.102 1188.96 479.138L1204.69 464.86C1206.98 462.781 1210.22 462.112 1213.15 463.112L1231.97 469.538C1234.9 470.538 1237.05 473.05 1237.59 476.096L1241.31 497.017Z" className={cn("cursor-pointer stroke-2 stroke-gray-400 dark:stroke-gray-600 transition-all duration-200", getHexagonColor("Tokyo"), hoveredRegion === "Tokyo" && "stroke-black dark:stroke-white opacity-80")} onMouseEnter={() => setHoveredRegion("Tokyo")} onMouseLeave={() => setHoveredRegion(null)} onClick={() => mapClickHandler("Tokyo")} />

          <path id="Chiba" d="M1338.52 515.144C1339.04 518.04 1338.03 521 1335.84 522.971L1303.7 551.942C1301.41 554.006 1298.18 554.668 1295.26 553.672L1255.94 540.242C1253.02 539.245 1250.87 536.746 1250.33 533.712L1242.62 491.132C1242.1 488.236 1243.11 485.276 1245.3 483.305L1277.44 454.334C1279.73 452.269 1282.96 451.607 1285.88 452.604L1325.2 466.033C1328.11 467.03 1330.26 469.53 1330.81 472.564L1338.52 515.144Z" className={cn("cursor-pointer stroke-2 stroke-gray-400 dark:stroke-gray-600 transition-all duration-200", getHexagonColor("Chiba"), hoveredRegion === "Chiba" && "stroke-black dark:stroke-white opacity-80")} onMouseEnter={() => setHoveredRegion("Chiba")} onMouseLeave={() => setHoveredRegion(null)} onClick={() => mapClickHandler("Chiba")} />

          <path id="Saitama" d="M1175.89 546.194C1176.42 549.089 1175.41 552.05 1173.22 554.02L1141.08 582.991C1138.79 585.056 1135.56 585.718 1132.64 584.721L1093.32 571.292C1090.4 570.295 1088.25 567.796 1087.7 564.761L1080 522.182C1079.48 519.286 1080.49 516.325 1082.67 514.355L1114.81 485.384C1117.1 483.319 1120.33 482.656 1123.25 483.653L1162.57 497.083C1165.49 498.079 1167.64 500.579 1168.19 503.614L1175.89 546.194Z" className={cn("cursor-pointer stroke-2 stroke-gray-400 dark:stroke-gray-600 transition-all duration-200", getHexagonColor("Saitama"), hoveredRegion === "Saitama" && "stroke-black dark:stroke-white opacity-80")} onMouseEnter={() => setHoveredRegion("Saitama")} onMouseLeave={() => setHoveredRegion(null)} onClick={() => mapClickHandler("Saitama")} />

          <path id="Gunma" d="M1115.92 479.527C1116.44 482.423 1115.43 485.383 1113.24 487.354L1081.1 516.325C1078.81 518.389 1075.58 519.051 1072.67 518.055L1033.35 504.625C1030.43 503.628 1028.28 501.129 1027.73 498.095L1020.03 455.515C1019.5 452.619 1020.51 449.659 1022.7 447.688L1054.84 418.717C1057.13 416.652 1060.36 415.99 1063.28 416.987L1102.6 430.416C1105.52 431.413 1107.67 433.912 1108.21 436.947L1115.92 479.527Z" className={cn("cursor-pointer stroke-2 stroke-gray-400 dark:stroke-gray-600 transition-all duration-200", getHexagonColor("Gunma"), hoveredRegion === "Gunma" && "stroke-black dark:stroke-white opacity-80")} onMouseEnter={() => setHoveredRegion("Gunma")} onMouseLeave={() => setHoveredRegion(null)} onClick={() => mapClickHandler("Gunma")} />

          <path id="Tochigi" d="M1203.32 457.425C1203.85 460.321 1202.84 463.281 1200.65 465.252L1168.51 494.223C1166.22 496.287 1162.99 496.949 1160.07 495.953L1120.75 482.523C1117.83 481.526 1115.68 479.027 1115.13 475.993L1107.43 433.413C1106.91 430.517 1107.92 427.557 1110.1 425.586L1142.25 396.615C1144.54 394.55 1147.77 393.888 1150.68 394.884L1190 408.314C1192.92 409.311 1195.07 411.81 1195.62 414.845L1203.32 457.425Z" className={cn("cursor-pointer stroke-2 stroke-gray-400 dark:stroke-gray-600 transition-all duration-200", getHexagonColor("Tochigi"), hoveredRegion === "Tochigi" && "stroke-black dark:stroke-white opacity-80")} onMouseEnter={() => setHoveredRegion("Tochigi")} onMouseLeave={() => setHoveredRegion(null)} onClick={() => mapClickHandler("Tochigi")} />

          <path id="Ibaraki" d="M1291.3 436.478C1291.82 439.374 1290.81 442.335 1288.63 444.305L1256.48 473.276C1254.19 475.341 1250.96 476.002 1248.05 475.006L1208.73 461.577C1205.81 460.58 1203.66 458.081 1203.11 455.046L1195.41 412.466C1194.88 409.571 1195.89 406.61 1198.08 404.64L1230.22 375.668C1232.51 373.604 1235.74 372.941 1238.66 373.938L1277.98 387.367C1280.9 388.364 1283.05 390.864 1283.59 393.898L1291.3 436.478Z" className={cn("cursor-pointer stroke-2 stroke-gray-400 dark:stroke-gray-600 transition-all duration-200", getHexagonColor("Ibaraki"), hoveredRegion === "Ibaraki" && "stroke-black dark:stroke-white opacity-80")} onMouseEnter={() => setHoveredRegion("Ibaraki")} onMouseLeave={() => setHoveredRegion(null)} onClick={() => mapClickHandler("Ibaraki")} />

          {/* Tohoku */}
          <path id="Fukushima" d="M1232.75 368.36C1233.27 371.256 1232.26 374.217 1230.07 376.187L1197.93 405.158C1195.64 407.223 1192.41 407.885 1189.49 406.888L1150.17 393.459C1147.25 392.462 1145.1 389.963 1144.56 386.928L1136.85 344.348C1136.33 341.453 1137.34 338.492 1139.53 336.522L1171.67 307.55C1173.96 305.486 1177.19 304.823 1180.11 305.82L1219.43 319.249C1222.34 320.246 1224.49 322.746 1225.04 325.78L1232.75 368.36Z" className={cn("cursor-pointer stroke-2 stroke-gray-400 dark:stroke-gray-600 transition-all duration-200", getHexagonColor("Fukushima"), hoveredRegion === "Fukushima" && "stroke-black dark:stroke-white opacity-80")} onMouseEnter={() => setHoveredRegion("Fukushima")} onMouseLeave={() => setHoveredRegion(null)} onClick={() => mapClickHandler("Fukushima")} />

          <path id="Yamagata" d="M1263.45 280.828C1263.98 283.724 1262.96 286.685 1260.78 288.655L1228.64 317.626C1226.35 319.691 1223.12 320.352 1220.2 319.356L1180.88 305.927C1177.96 304.93 1175.81 302.431 1175.26 299.396L1167.56 256.816C1167.03 253.92 1168.05 250.96 1170.23 248.99L1202.37 220.018C1204.66 217.954 1207.89 217.291 1210.81 218.288L1250.13 231.717C1253.05 232.714 1255.2 235.214 1255.75 238.248L1263.45 280.828Z" className={cn("cursor-pointer stroke-2 stroke-gray-400 dark:stroke-gray-600 transition-all duration-200", getHexagonColor("Yamagata"), hoveredRegion === "Yamagata" && "stroke-black dark:stroke-white opacity-80")} onMouseEnter={() => setHoveredRegion("Yamagata")} onMouseLeave={() => setHoveredRegion(null)} onClick={() => mapClickHandler("Yamagata")} />

          <path id="Akita" d="M1293.43 193.049C1293.96 195.944 1292.94 198.905 1290.76 200.875L1258.62 229.846C1256.33 231.911 1253.1 232.573 1250.18 231.576L1210.86 218.147C1207.94 217.15 1205.79 214.651 1205.24 211.617L1197.54 169.037C1197.02 166.141 1198.03 163.181 1200.21 161.21L1232.35 132.239C1234.64 130.174 1237.87 129.512 1240.79 130.508L1280.11 143.938C1283.03 144.935 1285.18 147.434 1285.73 150.469L1293.43 193.049Z" className={cn("cursor-pointer stroke-2 stroke-gray-400 dark:stroke-gray-600 transition-all duration-200", getHexagonColor("Akita"), hoveredRegion === "Akita" && "stroke-black dark:stroke-white opacity-80")} onMouseEnter={() => setHoveredRegion("Akita")} onMouseLeave={() => setHoveredRegion(null)} onClick={() => mapClickHandler("Akita")} />

          <path id="Miyagi" d="M1321.36 350.832C1321.88 353.727 1320.87 356.688 1318.69 358.658L1286.55 387.629C1284.26 389.694 1281.03 390.356 1278.11 389.359L1238.79 375.93C1235.87 374.933 1233.72 372.434 1233.17 369.399L1225.47 326.82C1224.94 323.924 1225.95 320.963 1228.14 318.993L1260.28 290.022C1262.57 287.957 1265.8 287.294 1268.72 288.291L1308.04 301.72C1310.96 302.717 1313.11 305.217 1313.66 308.252L1321.36 350.832Z" className={cn("cursor-pointer stroke-2 stroke-gray-400 dark:stroke-gray-600 transition-all duration-200", getHexagonColor("Miyagi"), hoveredRegion === "Miyagi" && "stroke-black dark:stroke-white opacity-80")} onMouseEnter={() => setHoveredRegion("Miyagi")} onMouseLeave={() => setHoveredRegion(null)} onClick={() => mapClickHandler("Miyagi")} />

          <path id="Iwate" d="M1351.34 263.052C1351.86 265.948 1350.85 268.909 1348.67 270.879L1316.53 299.85C1314.24 301.915 1311.01 302.577 1308.09 301.58L1268.77 288.151C1265.85 287.154 1263.7 284.655 1263.15 281.62L1255.45 239.04C1254.92 236.145 1255.94 233.184 1258.12 231.214L1290.26 202.242C1292.55 200.178 1295.78 199.515 1298.7 200.512L1338.02 213.941C1340.94 214.938 1343.09 217.438 1343.64 220.472L1351.34 263.052Z" className={cn("cursor-pointer stroke-2 stroke-gray-400 dark:stroke-gray-600 transition-all duration-200", getHexagonColor("Iwate"), hoveredRegion === "Iwate" && "stroke-black dark:stroke-white opacity-80")} onMouseEnter={() => setHoveredRegion("Iwate")} onMouseLeave={() => setHoveredRegion(null)} onClick={() => mapClickHandler("Iwate")} />

          <path id="Aomori" d="M1382.05 175.52C1382.57 178.416 1381.56 181.377 1379.37 183.347L1347.23 212.318C1344.94 214.382 1341.71 215.044 1338.79 214.048L1299.47 200.618C1296.56 199.622 1294.41 197.122 1293.86 194.088L1286.15 151.508C1285.63 148.612 1286.64 145.652 1288.83 143.682L1320.97 114.71C1323.26 112.645 1326.49 111.983 1329.41 112.98L1368.73 126.409C1371.65 127.406 1373.79 129.906 1374.34 132.94L1382.05 175.52Z" className={cn("cursor-pointer stroke-2 stroke-gray-400 dark:stroke-gray-600 transition-all duration-200", getHexagonColor("Aomori"), hoveredRegion === "Aomori" && "stroke-black dark:stroke-white opacity-80")} onMouseEnter={() => setHoveredRegion("Aomori")} onMouseLeave={() => setHoveredRegion(null)} onClick={() => mapClickHandler("Aomori")} />

          {/* Hokkaido */}
          <path id="Hokkaido_2" d="M1495.71 82.3391C1496.24 85.2348 1495.22 88.1955 1493.04 90.1657L1456.99 122.662C1454.69 124.727 1451.47 125.389 1448.55 124.392L1404.38 109.307C1401.46 108.31 1399.31 105.811 1398.76 102.776L1390.12 55.0145C1389.6 52.1189 1390.61 49.1582 1392.79 47.1879L1428.85 14.6914C1431.14 12.6267 1434.37 11.9638 1437.29 12.9606L1481.45 28.0461C1484.37 29.0429 1486.52 31.5426 1487.07 34.5772L1495.71 82.3391Z" className={cn("cursor-pointer stroke-2 stroke-gray-400 dark:stroke-gray-600 transition-all duration-200", getHexagonColor("Hokkaido_2"), hoveredRegion === "Hokkaido_2" && "stroke-black dark:stroke-white opacity-80")} onMouseEnter={() => setHoveredRegion("Hokkaido_2")} onMouseLeave={() => setHoveredRegion(null)} onClick={() => mapClickHandler("Hokkaido_2")} />
        </g>

        <defs>
          <clipPath id="clip0_3_6">
            <rect width="1512" height="982" fill="white" transform="translate(0.891235)"/>
          </clipPath>
        </defs>
      </svg>

      {/* Tooltip */}
      {hoveredRegion && (
        <div className="absolute bottom-4 left-4 bg-black dark:bg-white text-white dark:text-black px-2 py-1 rounded text-sm pointer-events-none">
          {getRegionName(hoveredRegion.replace('_2', '').toLowerCase())}
        </div>
      )}
    </div>
  );
}